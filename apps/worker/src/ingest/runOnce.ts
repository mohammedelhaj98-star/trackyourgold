import type { Prisma } from "@prisma/client";

import { SOURCE_CODES } from "@trackyourgold/shared";

import { getWorkerConfig } from "../config.js";
import { db } from "../db/prisma.js";
import { logger } from "../logger.js";
import { finishRun, recordFailure, recordSuccess, startRun } from "./health/health.js";
import { getLastNormalized, getSource, persistNormalizedRates, shouldRun, storeRawSnapshot } from "./normalize/normalize.js";
import { GoldApiProvider } from "./providers/market/goldApi.js";
import { MetalsApiProvider } from "./providers/market/metalsApi.js";
import type { MarketProvider } from "./providers/market/provider.js";
import { parseMalabarQatarRates } from "./providers/retail/malabar.js";
import { fetchRobots } from "./robots/robots.js";

function buildUrl(host: string, path: string) {
  const normalizedHost = host.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `https://${normalizedHost}`);
}

function getMarketProvider(): MarketProvider {
  const config = getWorkerConfig();
  const providerConfig = {
    baseUrl: config.MARKET_API_BASE_URL,
    apiKey: config.MARKET_API_KEY,
    timeoutMs: config.MARKET_API_TIMEOUT_MS
  };

  if (config.MARKET_API_PROVIDER === "gold_api") {
    return new GoldApiProvider(providerConfig);
  }

  return new MetalsApiProvider(providerConfig);
}

export async function ingestMarket() {
  const config = getWorkerConfig();
  const { source, latest } = await getLastNormalized(SOURCE_CODES.market);
  if (!shouldRun(latest?.asOf ?? null, config.MARKET_INGEST_EVERY_MINUTES)) {
    return { skipped: true, reason: "cadence" as const };
  }

  const provider = getMarketProvider();
  const result = await provider.getMarketCaratRates("QAR");
  await storeRawSnapshot(source.id, result.rawBody, result.contentType, result.status);
  await persistNormalizedRates({
    sourceId: source.id,
    asOf: result.asOf,
    currency: "QAR",
    unit: result.unit,
    ratesByKarat: result.ratesByKarat,
    meta: { provider: config.MARKET_API_PROVIDER }
  });
  await recordSuccess(source.id, result.asOf);
  return { skipped: false, asOf: result.asOf };
}

export async function ingestRetail() {
  const config = getWorkerConfig();
  const { source, latest } = await getLastNormalized(SOURCE_CODES.retail);
  if (!shouldRun(latest?.asOf ?? null, config.RETAIL_INGEST_EVERY_MINUTES)) {
    return { skipped: true, reason: "cadence" as const };
  }

  const robots = await fetchRobots(db, source, config.ROBOTS_CACHE_TTL_HOURS, {
    host: config.RETAIL_MALABAR_HOST,
    path: config.RETAIL_MALABAR_PATH
  });
  if (!robots.allowed) {
    await recordFailure(source.id, source.code, "compliance_blocked", null, config.ALERT_WEBHOOK_URL);
    return { skipped: true, reason: "compliance_blocked" as const };
  }

  const lastSnapshot = await db.priceSnapshotRaw.findFirst({
    where: { sourceId: source.id },
    orderBy: { fetchedAt: "desc" }
  });

  if (lastSnapshot) {
    const elapsedMs = Date.now() - lastSnapshot.fetchedAt.getTime();
    const minDelayMs = (60 / config.RETAIL_RATE_LIMIT_PER_MINUTE) * 1000;
    if (elapsedMs < minDelayMs) {
      return { skipped: true, reason: "rate_limit" as const };
    }
  }

  const response = await fetch(buildUrl(config.RETAIL_MALABAR_HOST, config.RETAIL_MALABAR_PATH));
  const html = await response.text();
  await storeRawSnapshot(source.id, html, response.headers.get("content-type") ?? "text/html", response.status);

  const parsed = parseMalabarQatarRates(html);
  const asOf = new Date();
  await persistNormalizedRates({
    sourceId: source.id,
    asOf,
    currency: "QAR",
    unit: "per_gram",
    ratesByKarat: {
      "24K": parsed.price24k,
      "22K": parsed.price22k,
      "21K": parsed.price24k * (21 / 24),
      "18K": parsed.price24k * (18 / 24)
    },
    meta: {
      derived: {
        "21K": true,
        "18K": true
      },
      base: "24K",
      asOfText: parsed.asOfText
    }
  });
  await recordSuccess(source.id, asOf);
  return { skipped: false, asOf };
}

export async function ingestAll() {
  const config = getWorkerConfig();
  const run = await startRun();
  const summary: Record<string, unknown> = {};
  let status: "ok" | "partial" | "failed" = "ok";

  try {
    summary.market = await ingestMarket();
  } catch (error) {
    status = "partial";
    const source = await getSource(SOURCE_CODES.market);
    await recordFailure(
      source.id,
      source.code,
      error instanceof Error ? error.message : "market_failed",
      null,
      config.ALERT_WEBHOOK_URL
    );
    summary.market = { error: error instanceof Error ? error.message : "market_failed" };
  }

  try {
    summary.retail = await ingestRetail();
  } catch (error) {
    status = status === "ok" ? "partial" : "failed";
    const source = await getSource(SOURCE_CODES.retail);
    await recordFailure(
      source.id,
      source.code,
      error instanceof Error ? error.message : "retail_failed",
      null,
      config.ALERT_WEBHOOK_URL
    );
    summary.retail = { error: error instanceof Error ? error.message : "retail_failed" };
  }

  await finishRun(run.id, status, summary as Prisma.InputJsonValue);
  logger.info("Ingest run completed.", { status, summary });
  return { status, summary };
}

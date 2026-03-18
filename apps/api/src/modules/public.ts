import type { PrismaClient } from "@prisma/client";

import { DEFAULT_MARKET, isStale, SOURCE_CODES } from "@trackyourgold/shared";

import { getLatestRateLayer, mapPriceRecord } from "../lib/pricing.js";

export async function getPublicHome(db: PrismaClient) {
  const [market, retail, heroSetting] = await Promise.all([
    getLatestRateLayer(db, "market"),
    getLatestRateLayer(db, "retail").catch(() => null),
    db.setting.findUnique({ where: { key: "homepage.hero" } })
  ]);

  return {
    market: DEFAULT_MARKET,
    currency: market.price.currency,
    latestPrice22k: Number(market.price.price22kPerGram),
    latestPrice24k: Number(market.price.price24kPerGram),
    marketAsOf: market.price.asOf,
    marketStale: isStale(market.price.asOf, 30),
    retail: retail
      ? {
          latestPrice22k: Number(retail.price.price22kPerGram),
          latestPrice24k: Number(retail.price.price24kPerGram),
          asOf: retail.price.asOf,
          stale: isStale(retail.price.asOf, 360)
        }
      : null,
    hero: heroSetting?.value ?? null
  };
}

export async function getMarkets(db: PrismaClient) {
  return db.market.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function getLatestRates(db: PrismaClient, layer: "market" | "retail") {
  const { source, price } = await getLatestRateLayer(db, layer);

  return {
    asOf: price.asOf,
    currency: price.currency,
    unit: price.unit,
    pricesByKarat: mapPriceRecord(price),
    source: {
      code: source.code,
      name: source.name
    },
    stale: isStale(price.asOf, layer === "market" ? 30 : 360)
  };
}

export async function getQuoteHistory(db: PrismaClient, layer: "market" | "retail", days: number) {
  const sourceCode = layer === "market" ? SOURCE_CODES.market : SOURCE_CODES.retail;
  const source = await db.priceSource.findUnique({ where: { code: sourceCode } });
  if (!source) {
    return [];
  }

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const records = await db.priceNormalized.findMany({
    where: {
      sourceId: source.id,
      asOf: { gte: cutoff }
    },
    orderBy: { asOf: "asc" },
    take: 240
  });

  return records.map((record) => ({
    asOf: record.asOf,
    price22k: Number(record.price22kPerGram),
    price24k: Number(record.price24kPerGram)
  }));
}

export async function getSourceStatus(db: PrismaClient) {
  const rows = await db.sourceHealth.findMany({
    include: { source: true },
    orderBy: { source: { code: "asc" } }
  });

  return rows.map((row) => ({
    code: row.source.code,
    name: row.source.name,
    enabled: row.source.enabled,
    lastSuccessAt: row.lastSuccessAt,
    consecutiveFailures: row.consecutiveFailures,
    stale: row.lastParsedAsOf ? isStale(row.lastParsedAsOf, row.staleAfterMinutes) : true,
    lastError: row.lastError
  }));
}

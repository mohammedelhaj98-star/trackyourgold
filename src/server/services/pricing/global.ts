import "server-only";

import { Prisma, SnapshotStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

const TROY_OUNCE_GRAMS = 31.1034768;

type ProviderResult = {
  provider: string;
  value: number;
  meta?: Record<string, unknown>;
};

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(env.GLOBAL_PRICE_REQUEST_TIMEOUT_MS),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Provider responded with ${response.status}: ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { accept: "text/plain,text/csv" },
    signal: AbortSignal.timeout(env.GLOBAL_PRICE_REQUEST_TIMEOUT_MS),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Provider responded with ${response.status}: ${url}`);
  }

  return response.text();
}

async function getXauUsdFromAlphaVantage(): Promise<ProviderResult> {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY is required for alpha-vantage gold pricing.");
  }

  const data = await fetchJson<Record<string, Record<string, string>>>(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${env.ALPHA_VANTAGE_API_KEY}`
  );
  const quote = data["Realtime Currency Exchange Rate"];
  const value = Number(quote?.["5. Exchange Rate"]);
  if (!value) throw new Error("Alpha Vantage XAU/USD response is missing a usable value.");
  return { provider: "alpha-vantage", value, meta: quote };
}

async function getXauUsdFromStooq(): Promise<ProviderResult> {
  const text = await fetchText("https://stooq.com/q/l/?s=xauusd&i=d");
  const lines = text.trim().split(/\r?\n/);
  const last = lines.at(-1) ?? "";
  const parts = last.split(",");
  const closeValue = Number(parts[6]);
  const fallbackValue = [...parts]
    .reverse()
    .map((part) => Number(part))
    .find((part) => Number.isFinite(part) && part > 0);
  const value = Number.isFinite(closeValue) && closeValue > 0 ? closeValue : fallbackValue;
  if (!value) throw new Error("Stooq XAU/USD response is missing a usable value.");
  return { provider: "stooq", value, meta: { raw: last } };
}

async function getUsdQarFromOpenErApi(): Promise<ProviderResult> {
  const data = await fetchJson<{ rates?: Record<string, number> }>("https://open.er-api.com/v6/latest/USD");
  const value = Number(data.rates?.QAR);
  if (!value) throw new Error("open.er-api response is missing USD/QAR.");
  return { provider: "open-er-api", value, meta: data.rates };
}

async function getUsdQarFromAlphaVantage(): Promise<ProviderResult> {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY is required for alpha-vantage FX.");
  }

  const data = await fetchJson<Record<string, Record<string, string>>>(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=QAR&apikey=${env.ALPHA_VANTAGE_API_KEY}`
  );
  const quote = data["Realtime Currency Exchange Rate"];
  const value = Number(quote?.["5. Exchange Rate"]);
  if (!value) throw new Error("Alpha Vantage USD/QAR response is missing a usable value.");
  return { provider: "alpha-vantage", value, meta: quote };
}

async function resolveProvider(primary: string, backup: string, kind: "gold" | "fx") {
  const goldProviders: Record<string, () => Promise<ProviderResult>> = {
    "alpha-vantage": getXauUsdFromAlphaVantage,
    stooq: getXauUsdFromStooq
  };
  const fxProviders: Record<string, () => Promise<ProviderResult>> = {
    "open-er-api": getUsdQarFromOpenErApi,
    "alpha-vantage": getUsdQarFromAlphaVantage
  };

  const providers = kind === "gold" ? goldProviders : fxProviders;

  try {
    return await providers[primary]();
  } catch (primaryError) {
    const fallback = providers[backup];
    if (!fallback) throw primaryError;
    return await fallback();
  }
}

export async function fetchLiveGlobalBenchmark() {
  const [gold, fx] = await Promise.all([
    resolveProvider(env.GLOBAL_GOLD_PRIMARY_PROVIDER, env.GLOBAL_GOLD_BACKUP_PROVIDER, "gold"),
    resolveProvider(env.GLOBAL_FX_PRIMARY_PROVIDER, env.GLOBAL_FX_BACKUP_PROVIDER, "fx")
  ]);

  const qarPerGramEstimate = (gold.value / TROY_OUNCE_GRAMS) * fx.value;
  const capturedAt = new Date();

  return {
    goldProvider: gold.provider,
    fxProvider: fx.provider,
    xauUsd: gold.value,
    usdQar: fx.value,
    qarPerGramEstimate,
    capturedAt
  };
}

export async function ingestGlobalMarketData() {
  const country = await db.country.findUnique({ where: { slug: "qatar" } });
  if (!country) {
    throw new Error("Qatar country record is not configured.");
  }

  try {
    const benchmark = await fetchLiveGlobalBenchmark();

    await db.$transaction([
      db.exchangeRate.create({
        data: {
          countryId: country.id,
          provider: benchmark.fxProvider,
          baseCurrency: "USD",
          quoteCurrency: "QAR",
          rate: benchmark.usdQar,
          capturedAt: benchmark.capturedAt,
          status: SnapshotStatus.SUCCESS,
          metadataJson: undefined
        }
      }),
      db.globalGoldPrice.create({
        data: {
          countryId: country.id,
          provider: benchmark.goldProvider,
          symbol: "XAU/USD",
          priceUsdPerTroyOunce: benchmark.xauUsd,
          qarPerGramEstimate: benchmark.qarPerGramEstimate,
          capturedAt: benchmark.capturedAt,
          status: SnapshotStatus.SUCCESS,
          metadataJson: undefined as Prisma.InputJsonValue | undefined
        }
      }),
      db.systemLog.create({
        data: {
          level: "INFO",
          category: "market-data",
          message: "Global spot-derived benchmark refreshed.",
          metadataJson: {
            goldProvider: benchmark.goldProvider,
            fxProvider: benchmark.fxProvider,
            qarPerGramEstimate: benchmark.qarPerGramEstimate
          }
        }
      })
    ]);

    return {
      ok: true,
      goldProvider: benchmark.goldProvider,
      fxProvider: benchmark.fxProvider,
      xauUsd: benchmark.xauUsd,
      usdQar: benchmark.usdQar,
      qarPerGramEstimate: benchmark.qarPerGramEstimate
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown global pricing failure.";
    await db.systemLog.create({
      data: {
        level: "ERROR",
        category: "market-data",
        message,
        metadataJson: {
          primaryGoldProvider: env.GLOBAL_GOLD_PRIMARY_PROVIDER,
          primaryFxProvider: env.GLOBAL_FX_PRIMARY_PROVIDER
        }
      }
    });

    return {
      ok: false,
      xauUsd: null,
      usdQar: null,
      qarPerGramEstimate: null,
      error: message
    };
  }
}

import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { formatDate, percentChange } from "@/lib/utils";
import { evaluateRecommendation } from "@/server/services/pricing/recommendation";
import { buildMarketSummary } from "@/server/services/pricing/summaries";
import { fetchLiveGlobalBenchmark } from "@/server/services/pricing/global";
import { fetchLiveMalabarRates } from "@/server/services/pricing/malabar";
import type {
  PublicCountrySummary,
  PublicHistoryPageData,
  PublicMarketOverviewData,
  PublicPricePageData
} from "@/server/services/pricing/public-cache";

const CACHE_DIR = path.join(process.cwd(), "tmp");
const CACHE_PATH = path.join(CACHE_DIR, "runtime-public-market-cache.json");
const RUNTIME_COUNTRY: PublicCountrySummary = {
  id: "runtime-qatar",
  code: "QA",
  slug: "qatar",
  name: "Qatar",
  currencyCode: "QAR",
  timezone: "Asia/Qatar"
};
const PRIMARY_STORE_NAME = "Malabar Gold & Diamonds Qatar";
const MAX_POINTS = 240;
const MAX_CHART_POINTS = 120;
const MAX_RECOMMENDATION_POINTS = 90;
const STALE_AFTER_MS = 35 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __trackYourGoldRuntimePublicCache: RuntimePublicCache | undefined;
}

type RuntimeSeriesPoint = {
  timestamp: string;
  price: number;
  storeName: string;
};

type RuntimeBenchmarkPoint = {
  timestamp: string;
  qarPerGramEstimate: number;
  goldProvider: string;
  fxProvider: string;
};

type RuntimePublicCache = {
  refreshedAt: Date;
  country: PublicCountrySummary;
  seriesByKarat: Record<string, RuntimeSeriesPoint[]>;
  benchmarkSeries: RuntimeBenchmarkPoint[];
  overview: PublicMarketOverviewData;
  pricePages: Record<string, PublicPricePageData>;
  historyPages: Record<string, PublicHistoryPageData>;
};

function downsample<T>(items: T[], maxPoints: number) {
  if (items.length <= maxPoints) {
    return items;
  }

  const lastIndex = items.length - 1;
  const step = lastIndex / (maxPoints - 1);
  const sampled: T[] = [];

  for (let index = 0; index < maxPoints; index += 1) {
    sampled.push(items[Math.round(index * step)]);
  }

  return sampled;
}

function parseRuntimeCache(raw: string) {
  return JSON.parse(raw, (key, candidate) => {
    if (typeof candidate === "string" && key.endsWith("At")) {
      const parsed = Date.parse(candidate);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed);
      }
    }

    return candidate;
  }) as RuntimePublicCache;
}

async function loadRuntimeCache() {
  if (global.__trackYourGoldRuntimePublicCache) {
    return global.__trackYourGoldRuntimePublicCache;
  }

  try {
    const cache = parseRuntimeCache(await readFile(CACHE_PATH, "utf8"));
    global.__trackYourGoldRuntimePublicCache = cache;
    return cache;
  } catch {
    return null;
  }
}

async function saveRuntimeCache(cache: RuntimePublicCache) {
  global.__trackYourGoldRuntimePublicCache = cache;

  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(cache), "utf8");
  } catch (error) {
    console.error("[runtime-public-cache:save]", error);
  }
}

function appendPoint<T extends { timestamp: string }>(items: T[], next: T) {
  const latest = items.at(-1);
  if (latest?.timestamp === next.timestamp) {
    return items;
  }

  const updated = [...items, next];
  return updated.slice(-MAX_POINTS);
}

function makeChartData(series: RuntimeSeriesPoint[]) {
  return downsample(series, MAX_CHART_POINTS).map((point) => ({
    label: formatDate(new Date(point.timestamp), "MMM d"),
    timestamp: point.timestamp,
    price: point.price
  }));
}

function makeComparisonData(chartData: PublicPricePageData["chartData"], benchmarkSeries: RuntimeBenchmarkPoint[]) {
  const alignedBenchmarks = downsample(benchmarkSeries, chartData.length);

  return chartData.map((point, index) => {
    const benchmark = alignedBenchmarks[index];
    const spot = benchmark?.qarPerGramEstimate ?? 0;
    const premium = spot > 0 ? ((point.price - spot) / spot) * 100 : 0;

    return {
      ...point,
      spot,
      premium
    };
  });
}

function computeRecommendationHistory(historyPages: RuntimePublicCache["historyPages"], karatLabel: string) {
  return historyPages[karatLabel]?.recommendationHistory ?? [];
}

export async function refreshRuntimePublicMarketCache(countrySlug = "qatar") {
  if (countrySlug !== "qatar") {
    return null;
  }

  const existing = await loadRuntimeCache();
  const [malabar, benchmark] = await Promise.all([fetchLiveMalabarRates(), fetchLiveGlobalBenchmark()]);
  const nowIso = benchmark.capturedAt.toISOString();
  const seriesByKarat = { ...(existing?.seriesByKarat ?? {}) };
  const benchmarkSeries = appendPoint(existing?.benchmarkSeries ?? [], {
    timestamp: nowIso,
    qarPerGramEstimate: benchmark.qarPerGramEstimate,
    goldProvider: benchmark.goldProvider,
    fxProvider: benchmark.fxProvider
  });
  const pricePages: RuntimePublicCache["pricePages"] = {};
  const historyPages: RuntimePublicCache["historyPages"] = {};
  const overviewCards: PublicMarketOverviewData["cards"] = [];

  for (const rate of malabar.rates) {
    const updatedSeries = appendPoint(seriesByKarat[rate.karatLabel] ?? [], {
      timestamp: nowIso,
      price: rate.pricePerGram,
      storeName: PRIMARY_STORE_NAME
    });
    seriesByKarat[rate.karatLabel] = updatedSeries;

    const latest = updatedSeries.at(-1)!;
    const dayAgo = updatedSeries.at(Math.max(0, updatedSeries.length - 3)) ?? latest;
    const weekAgo = updatedSeries.at(Math.max(0, updatedSeries.length - 15)) ?? latest;
    const recommendation = await evaluateRecommendation({
      countryId: RUNTIME_COUNTRY.id,
      karatLabel: rate.karatLabel,
      snapshots: updatedSeries.map((point, index) => ({
        id: `${rate.karatLabel}-${index}-${point.timestamp}`,
        pricePerGram: point.price,
        capturedAt: new Date(point.timestamp)
      })),
      spotEstimateQarPerGram: benchmark.qarPerGramEstimate
    });

    const latestPrice = latest.price;
    const change24h = percentChange(latestPrice, dayAgo.price);
    const change7d = percentChange(latestPrice, weekAgo.price);
    const chartData = makeChartData(updatedSeries);
    const comparisonData = makeComparisonData(chartData, benchmarkSeries);
    const summary = buildMarketSummary({
      karatLabel: rate.karatLabel,
      recommendation: recommendation
        ? {
            score: recommendation.score,
            confidenceBand: recommendation.confidenceBand,
            explanation: recommendation.explanation
          }
        : null,
      currentPrice: latestPrice,
      change7d,
      premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null
    });

    const previousHistory = computeRecommendationHistory(existing?.historyPages ?? {}, rate.karatLabel);
    const nextHistoryPoint = {
      label: formatDate(new Date(latest.timestamp), "MMM d"),
      score: recommendation?.score ?? 50,
      recommendation: recommendation?.label ?? "WAIT"
    };
    const recommendationHistory = [...previousHistory, nextHistoryPoint].slice(-MAX_RECOMMENDATION_POINTS);

    const pricePage: PublicPricePageData = {
      country: RUNTIME_COUNTRY,
      latestGlobal: {
        provider: benchmark.goldProvider,
        qarPerGramEstimate: benchmark.qarPerGramEstimate,
        capturedAt: benchmark.capturedAt
      },
      latestSnapshot: {
        id: `${rate.karatLabel}-${latest.timestamp}`,
        karatLabel: rate.karatLabel,
        pricePerGram: latestPrice,
        capturedAt: new Date(latest.timestamp),
        storeName: latest.storeName
      },
      recommendation,
      summary,
      chartData,
      stats: {
        latestPrice,
        change24h,
        change7d,
        premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null,
        lastUpdatedAt: new Date(latest.timestamp),
        storeName: latest.storeName
      },
      seoSections: {
        contentPages: [],
        faqs: [],
        articles: []
      },
      cachedAt: benchmark.capturedAt
    };

    pricePages[rate.karatLabel] = pricePage;
    historyPages[rate.karatLabel] = {
      ...pricePage,
      comparisonData,
      recommendationHistory
    };

    overviewCards.push({
      karatLabel: rate.karatLabel,
      pricePerGram: latestPrice,
      updatedAt: new Date(latest.timestamp),
      change24h,
      change7d,
      recommendation
    });
  }

  const cache: RuntimePublicCache = {
    refreshedAt: benchmark.capturedAt,
    country: RUNTIME_COUNTRY,
    seriesByKarat,
    benchmarkSeries,
    overview: {
      country: RUNTIME_COUNTRY,
      latestGlobal: {
        provider: benchmark.goldProvider,
        qarPerGramEstimate: benchmark.qarPerGramEstimate,
        capturedAt: benchmark.capturedAt
      },
      cards: overviewCards.sort((left, right) =>
        left.karatLabel.localeCompare(right.karatLabel, undefined, { numeric: true })
      ),
      lastUpdatedAt: benchmark.capturedAt,
      cachedAt: benchmark.capturedAt
    },
    pricePages,
    historyPages
  };

  await saveRuntimeCache(cache);
  return cache;
}

async function ensureRuntimeCache(countrySlug: string) {
  if (countrySlug !== "qatar") {
    return null;
  }

  const existing = await loadRuntimeCache();
  if (existing && Date.now() - existing.refreshedAt.getTime() <= STALE_AFTER_MS) {
    return existing;
  }

  try {
    return await refreshRuntimePublicMarketCache(countrySlug);
  } catch (error) {
    console.error("[runtime-public-cache:refresh]", error);
    return existing;
  }
}

export async function getRuntimeMarketOverview(countrySlug: string) {
  const cache = await ensureRuntimeCache(countrySlug);
  return cache?.overview ?? null;
}

export async function getRuntimePricePageData(countrySlug: string, karatLabel: string) {
  const cache = await ensureRuntimeCache(countrySlug);
  return cache?.pricePages[karatLabel] ?? null;
}

export async function getRuntimeHistoryPageData(countrySlug: string, karatLabel: string) {
  const cache = await ensureRuntimeCache(countrySlug);
  return cache?.historyPages[karatLabel] ?? null;
}

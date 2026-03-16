import "server-only";

import { ContentStatus, type Recommendation, type RecommendationReason } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber, formatDate, percentChange } from "@/lib/utils";
import { evaluateRecommendation } from "@/server/services/pricing/recommendation";
import { buildMarketSummary } from "@/server/services/pricing/summaries";

const CACHE_GROUP = "public_cache";

export type PublicCountrySummary = {
  id: string;
  code: string;
  slug: string;
  name: string;
  currencyCode: string;
  timezone: string;
};

export type PublicRecommendationReason = {
  code: string;
  weight: number;
  value: number;
  direction: "positive" | "negative" | "neutral";
  reason: string;
};

export type PublicRecommendation = {
  label: "STRONG_BUY" | "BUY" | "WAIT" | "AVOID";
  score: number;
  reasons: PublicRecommendationReason[];
  explanation: string;
  confidenceBand: string;
  summaryText: string;
  metrics: {
    currentPrice: number;
    change24h: number;
    change7d: number;
    avg30d: number;
    avg90d: number;
    low90d: number;
    high90d: number;
    premiumVsSpot: number | null;
    volatility: number;
  };
};

export type PublicMarketOverviewData = {
  country: PublicCountrySummary;
  latestGlobal: {
    provider: string;
    qarPerGramEstimate: number;
    capturedAt: Date;
  } | null;
  cards: Array<{
    karatLabel: string;
    pricePerGram: number;
    updatedAt: Date;
    change24h: number;
    change7d: number;
    recommendation: PublicRecommendation | null;
  }>;
  lastUpdatedAt: Date | null;
  cachedAt: Date;
};

export type PublicPricePageData = {
  country: PublicCountrySummary;
  latestGlobal: {
    provider: string;
    qarPerGramEstimate: number;
    capturedAt: Date;
  } | null;
  latestSnapshot: {
    id: string;
    karatLabel: string;
    pricePerGram: number;
    capturedAt: Date;
    storeName: string;
  };
  recommendation: PublicRecommendation | null;
  summary: string;
  chartData: Array<{
    label: string;
    timestamp: string;
    price: number;
  }>;
  stats: {
    latestPrice: number;
    change24h: number;
    change7d: number;
    premiumVsSpot: number | null;
    lastUpdatedAt: Date;
    storeName: string;
  };
  seoSections: {
    contentPages: Array<{
      id: string;
      slug: string;
      title: string;
      summary: string | null;
      type: string;
    }>;
    faqs: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
    articles: Array<{
      id: string;
      slug: string;
      title: string;
      excerpt: string;
    }>;
  };
  cachedAt: Date;
};

export type PublicHistoryPageData = PublicPricePageData & {
  comparisonData: Array<{
    label: string;
    timestamp: string;
    price: number;
    spot: number;
    premium: number;
  }>;
  recommendationHistory: Array<{
    label: string;
    score: number;
    recommendation: string;
  }>;
};

export type PublicCountryHubData = {
  country: {
    id: string;
    slug: string;
    name: string;
    cities: Array<{
      id: string;
      slug: string;
      name: string;
    }>;
    stores: Array<{
      id: string;
      slug: string;
      name: string;
      cityId: string | null;
    }>;
  };
  overview: PublicMarketOverviewData | null;
  cachedAt: Date;
};

export type PublicContentHubData = {
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
  }>;
  guides: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string | null;
  }>;
  faqs: Array<{
    id: string;
    slug: string;
    question: string;
    answer: string;
  }>;
  cachedAt: Date;
};

function parseCachedValue<T>(value: string): T {
  return JSON.parse(value, (key, candidate) => {
    if (typeof candidate === "string" && key.endsWith("At")) {
      const parsed = Date.parse(candidate);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed);
      }
    }

    return candidate;
  }) as T;
}

function toCountrySummary(country: {
  id: string;
  code: string;
  slug: string;
  name: string;
  currencyCode: string;
  timezone: string;
}): PublicCountrySummary {
  return {
    id: country.id,
    code: country.code,
    slug: country.slug,
    name: country.name,
    currencyCode: country.currencyCode,
    timezone: country.timezone
  };
}

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

function recommendationCacheKey(snapshotId: string) {
  return `public.market.recommendation.${snapshotId}`;
}

export function marketOverviewCacheKey(countrySlug: string) {
  return `public.market.overview.${countrySlug}`;
}

export function pricePageCacheKey(countrySlug: string, karatLabel: string) {
  return `public.market.price.${countrySlug}.${encodeURIComponent(karatLabel)}`;
}

export function historyPageCacheKey(countrySlug: string, karatLabel: string) {
  return `public.market.history.${countrySlug}.${encodeURIComponent(karatLabel)}`;
}

export function countryHubCacheKey(countrySlug: string) {
  return `public.market.country.${countrySlug}`;
}

export function contentHubCacheKey() {
  return "public.market.content-hub";
}

async function upsertCacheSetting(key: string, payload: unknown) {
  await db.setting.upsert({
    where: { key },
    create: {
      key,
      groupName: CACHE_GROUP,
      value: JSON.stringify(payload),
      valueType: "json",
      description: "Precomputed payload for public-facing market pages."
    },
    update: {
      groupName: CACHE_GROUP,
      value: JSON.stringify(payload),
      valueType: "json",
      description: "Precomputed payload for public-facing market pages."
    }
  });
}

async function readCacheSetting<T>(key: string) {
  const setting = await db.setting.findUnique({ where: { key } });
  if (!setting?.value) {
    return null;
  }

  try {
    return parseCachedValue<T>(setting.value);
  } catch (error) {
    console.error(`[public-cache:${key}]`, error);
    return null;
  }
}

function mapStoredRecommendation(
  recommendation: (Recommendation & { reasons: RecommendationReason[] }) | null
): PublicRecommendation | null {
  if (!recommendation) {
    return null;
  }

  return {
    label: recommendation.label,
    score: recommendation.score,
    reasons: recommendation.reasons.map((reason) => ({
      code: reason.code,
      weight: reason.weight,
      value: reason.value,
      direction: reason.direction as "positive" | "negative" | "neutral",
      reason: reason.reason
    })),
    explanation: recommendation.explanation,
    confidenceBand: recommendation.confidenceBand,
    summaryText: recommendation.summaryText ?? "",
    metrics: {
      currentPrice: 0,
      change24h: recommendation.change24h ? decimalToNumber(recommendation.change24h) : 0,
      change7d: recommendation.change7d ? decimalToNumber(recommendation.change7d) : 0,
      avg30d: 0,
      avg90d: 0,
      low90d: 0,
      high90d: 0,
      premiumVsSpot: recommendation.premiumVsSpot ? decimalToNumber(recommendation.premiumVsSpot) : null,
      volatility: 0
    }
  };
}

async function resolveRecommendation(input: {
  countryId: string;
  karatLabel: string;
  latestSnapshotId: string;
  snapshots: Array<{
    id: string;
    pricePerGram: { toString(): string } | number;
    capturedAt: Date;
  }>;
  spotEstimateQarPerGram: number | null;
}) {
  const stored = await db.recommendation.findFirst({
    where: { snapshotId: input.latestSnapshotId },
    orderBy: { createdAt: "desc" },
    include: { reasons: true }
  });

  if (stored) {
    const mapped = mapStoredRecommendation(stored);
    if (mapped) {
      const prices = input.snapshots.map((snapshot) => decimalToNumber(snapshot.pricePerGram));
      mapped.metrics.currentPrice = prices.at(-1) ?? 0;
      mapped.metrics.avg30d = average(prices.slice(-60));
      mapped.metrics.avg90d = average(prices.slice(-180));
      mapped.metrics.low90d = Math.min(...prices.slice(-180));
      mapped.metrics.high90d = Math.max(...prices.slice(-180));
      return mapped;
    }
  }

  return evaluateRecommendation({
    countryId: input.countryId,
    karatLabel: input.karatLabel,
    snapshots: input.snapshots,
    spotEstimateQarPerGram: input.spotEstimateQarPerGram
  });
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getCachedMarketOverview(countrySlug: string) {
  return readCacheSetting<PublicMarketOverviewData>(marketOverviewCacheKey(countrySlug));
}

export async function getCachedPricePageData(countrySlug: string, karatLabel: string) {
  return readCacheSetting<PublicPricePageData>(pricePageCacheKey(countrySlug, karatLabel));
}

export async function getCachedHistoryPageData(countrySlug: string, karatLabel: string) {
  return readCacheSetting<PublicHistoryPageData>(historyPageCacheKey(countrySlug, karatLabel));
}

export async function getCachedCountryHubData(countrySlug: string) {
  return readCacheSetting<PublicCountryHubData>(countryHubCacheKey(countrySlug));
}

export async function getCachedContentHubData() {
  return readCacheSetting<PublicContentHubData>(contentHubCacheKey());
}

export async function refreshPublicMarketCache(countrySlug = "qatar") {
  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  if (!country) {
    throw new Error("Country not found.");
  }

  const [latestGlobal, recentSnapshots, globalSeriesDesc, cities, stores, seoContentPages, faqs, articles, hubArticles, hubGuides, hubFaqs] =
    await Promise.all([
      db.globalGoldPrice.findFirst({
        where: { countryId: country.id },
        orderBy: { capturedAt: "desc" }
      }),
      db.goldPriceSnapshot.findMany({
        where: { countryId: country.id, sourceKind: "STORE" },
        orderBy: { capturedAt: "desc" },
        take: 60,
        include: { store: true }
      }),
      db.globalGoldPrice.findMany({
        where: { countryId: country.id },
        orderBy: { capturedAt: "desc" },
        take: 240
      }),
      db.city.findMany({
        where: { countryId: country.id, isActive: true },
        orderBy: { name: "asc" }
      }),
      db.store.findMany({
        where: { countryId: country.id },
        orderBy: { name: "asc" }
      }),
      db.contentPage.findMany({
        where: {
          countryId: country.id,
          status: ContentStatus.PUBLISHED,
          OR: [{ type: "GUIDE" }, { type: "MARKET_ANALYSIS" }, { type: "KARAT" }]
        },
        take: 6,
        orderBy: { publishAt: "desc" }
      }),
      db.faq.findMany({
        where: { countryId: country.id, isPublished: true },
        orderBy: { sortOrder: "asc" },
        take: 6
      }),
      db.blogArticle.findMany({
        where: { countryId: country.id, status: ContentStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 4
      }),
      db.blogArticle.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 12
      }),
      db.contentPage.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          type: { in: ["GUIDE", "MARKET_ANALYSIS", "LANDING"] }
        },
        orderBy: { publishAt: "desc" },
        take: 12
      }),
      db.faq.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        take: 12
      })
    ]);

  const latestGlobalSummary = latestGlobal
    ? {
        provider: latestGlobal.provider,
        qarPerGramEstimate: decimalToNumber(latestGlobal.qarPerGramEstimate),
        capturedAt: latestGlobal.capturedAt
      }
    : null;

  const orderedGlobalSeries = [...globalSeriesDesc].reverse();
  const latestByKarat = new Map<string, (typeof recentSnapshots)[number]>();
  for (const snapshot of recentSnapshots) {
    if (!latestByKarat.has(snapshot.karatLabel)) {
      latestByKarat.set(snapshot.karatLabel, snapshot);
    }
  }

  const cards: PublicMarketOverviewData["cards"] = [];
  let updatedKeys = 0;

  for (const latestSnapshot of latestByKarat.values()) {
    const series = await db.goldPriceSnapshot.findMany({
      where: {
        countryId: country.id,
        karatLabel: latestSnapshot.karatLabel,
        sourceKind: "STORE"
      },
      orderBy: { capturedAt: "asc" },
      take: 240,
      include: { store: true }
    });

    if (!series.length) {
      continue;
    }

    const recommendation = await resolveRecommendation({
      countryId: country.id,
      karatLabel: latestSnapshot.karatLabel,
      latestSnapshotId: latestSnapshot.id,
      snapshots: series.map((item) => ({
        id: item.id,
        pricePerGram: item.pricePerGram,
        capturedAt: item.capturedAt
      })),
      spotEstimateQarPerGram: latestGlobalSummary?.qarPerGramEstimate ?? null
    });

    const latestPrice = decimalToNumber(latestSnapshot.pricePerGram);
    const dayAgoPoint = series.at(Math.max(0, series.length - 3)) ?? latestSnapshot;
    const weekAgoPoint = series.at(Math.max(0, series.length - 15)) ?? latestSnapshot;
    const change24h = percentChange(latestPrice, decimalToNumber(dayAgoPoint.pricePerGram));
    const change7d = percentChange(latestPrice, decimalToNumber(weekAgoPoint.pricePerGram));
    const chartSeries = downsample(series, 120);
    const chartData = chartSeries.map((item) => ({
      label: formatDate(item.capturedAt, "MMM d"),
      timestamp: item.capturedAt.toISOString(),
      price: decimalToNumber(item.pricePerGram)
    }));

    const summary = buildMarketSummary({
      karatLabel: latestSnapshot.karatLabel,
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

    const globalChartSeries = downsample(orderedGlobalSeries, chartData.length);
    const comparisonData = chartData.map((point, index) => {
      const globalPoint = globalChartSeries[index];
      const spot = globalPoint ? decimalToNumber(globalPoint.qarPerGramEstimate) : 0;
      const premium = spot > 0 ? ((point.price - spot) / spot) * 100 : 0;

      return {
        ...point,
        spot,
        premium
      };
    });

    const recommendationHistory = await db.recommendation.findMany({
      where: { countryId: country.id, karatLabel: latestSnapshot.karatLabel },
      orderBy: { createdAt: "asc" },
      take: 90
    });

    const pricePayload: PublicPricePageData = {
      country: toCountrySummary(country),
      latestGlobal: latestGlobalSummary,
      latestSnapshot: {
        id: latestSnapshot.id,
        karatLabel: latestSnapshot.karatLabel,
        pricePerGram: latestPrice,
        capturedAt: latestSnapshot.capturedAt,
        storeName: latestSnapshot.store?.name ?? "Primary tracked store"
      },
      recommendation,
      summary,
      chartData,
      stats: {
        latestPrice,
        change24h,
        change7d,
        premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null,
        lastUpdatedAt: latestSnapshot.capturedAt,
        storeName: latestSnapshot.store?.name ?? "Primary tracked store"
      },
      seoSections: {
        contentPages: seoContentPages.map((page) => ({
          id: page.id,
          slug: page.slug,
          title: page.title,
          summary: page.summary,
          type: page.type
        })),
        faqs: faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })),
        articles: articles.map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt
        }))
      },
      cachedAt: new Date()
    };

    const historyPayload: PublicHistoryPageData = {
      ...pricePayload,
      comparisonData,
      recommendationHistory: recommendationHistory.map((item) => ({
        label: formatDate(item.createdAt, "MMM d"),
        score: item.score,
        recommendation: item.label
      }))
    };

    await upsertCacheSetting(pricePageCacheKey(countrySlug, latestSnapshot.karatLabel), pricePayload);
    await upsertCacheSetting(historyPageCacheKey(countrySlug, latestSnapshot.karatLabel), historyPayload);
    updatedKeys += 2;

    cards.push({
      karatLabel: latestSnapshot.karatLabel,
      pricePerGram: latestPrice,
      updatedAt: latestSnapshot.capturedAt,
      change24h,
      change7d,
      recommendation
    });
  }

  const overviewPayload: PublicMarketOverviewData = {
    country: toCountrySummary(country),
    latestGlobal: latestGlobalSummary,
    cards: cards.sort((left, right) =>
      left.karatLabel.localeCompare(right.karatLabel, undefined, { numeric: true })
    ),
    lastUpdatedAt: recentSnapshots[0]?.capturedAt ?? null,
    cachedAt: new Date()
  };

  const countryPayload: PublicCountryHubData = {
    country: {
      id: country.id,
      slug: country.slug,
      name: country.name,
      cities: cities.map((city) => ({
        id: city.id,
        slug: city.slug,
        name: city.name
      })),
      stores: stores.map((store) => ({
        id: store.id,
        slug: store.slug,
        name: store.name,
        cityId: store.cityId
      }))
    },
    overview: overviewPayload,
    cachedAt: new Date()
  };

  const contentHubPayload: PublicContentHubData = {
    articles: hubArticles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt
    })),
    guides: hubGuides.map((guide) => ({
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary
    })),
    faqs: hubFaqs.map((faq) => ({
      id: faq.id,
      slug: faq.slug,
      question: faq.question,
      answer: faq.answer
    })),
    cachedAt: new Date()
  };

  await upsertCacheSetting(marketOverviewCacheKey(countrySlug), overviewPayload);
  await upsertCacheSetting(countryHubCacheKey(countrySlug), countryPayload);
  await upsertCacheSetting(contentHubCacheKey(), contentHubPayload);
  updatedKeys += 3;

  return {
    ok: true,
    updatedKeys,
    karats: cards.map((card) => card.karatLabel)
  };
}

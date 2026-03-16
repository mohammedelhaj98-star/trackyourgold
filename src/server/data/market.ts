import "server-only";

import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber, formatDate, percentChange } from "@/lib/utils";
import {
  getCachedContentHubData,
  getCachedCountryHubData,
  getCachedHistoryPageData,
  getCachedMarketOverview,
  getCachedPricePageData
} from "@/server/services/pricing/public-cache";
import { buildMarketSummary } from "@/server/services/pricing/summaries";
import { evaluateRecommendation } from "@/server/services/pricing/recommendation";

function logMarketError(scope: string, error: unknown) {
  console.error(`[market:${scope}]`, error);
}

export async function getCountryBySlug(slug: string) {
  try {
    return await db.country.findUnique({ where: { slug } });
  } catch (error) {
    logMarketError(`country:${slug}`, error);
    return null;
  }
}

export async function getMarketOverview(countrySlug = "qatar") {
  try {
    const cached = await getCachedMarketOverview(countrySlug);
    if (cached) return cached;

    const country = await getCountryBySlug(countrySlug);
    if (!country) return null;

    const snapshots = await db.goldPriceSnapshot.findMany({
      where: { countryId: country.id, sourceKind: "STORE" },
      orderBy: { capturedAt: "desc" },
      take: 30,
      include: {
        store: true
      }
    });

    const latestByKarat = new Map<string, (typeof snapshots)[number]>();
    for (const snapshot of snapshots) {
      if (!latestByKarat.has(snapshot.karatLabel)) {
        latestByKarat.set(snapshot.karatLabel, snapshot);
      }
    }

    const latestGlobal = await db.globalGoldPrice.findFirst({
      where: { countryId: country.id },
      orderBy: { capturedAt: "desc" }
    });

    const cards = await Promise.all(
      [...latestByKarat.values()].map(async (snapshot) => {
        const series = await db.goldPriceSnapshot.findMany({
          where: { countryId: country.id, karatLabel: snapshot.karatLabel, sourceKind: "STORE" },
          orderBy: { capturedAt: "desc" },
          take: 180
        });

        const recommendation = await evaluateRecommendation({
          countryId: country.id,
          karatLabel: snapshot.karatLabel,
          snapshots: series.map((item) => ({ id: item.id, pricePerGram: item.pricePerGram, capturedAt: item.capturedAt })),
          spotEstimateQarPerGram: latestGlobal ? decimalToNumber(latestGlobal.qarPerGramEstimate) : null
        });

        const change24hPoint = series.at(2) ?? series.at(1) ?? snapshot;
        const change7dPoint = series.at(14) ?? series.at(series.length - 1) ?? snapshot;
        return {
          karatLabel: snapshot.karatLabel,
          pricePerGram: decimalToNumber(snapshot.pricePerGram),
          updatedAt: snapshot.capturedAt,
          change24h: percentChange(decimalToNumber(snapshot.pricePerGram), decimalToNumber(change24hPoint.pricePerGram)),
          change7d: percentChange(decimalToNumber(snapshot.pricePerGram), decimalToNumber(change7dPoint.pricePerGram)),
          recommendation
        };
      })
    );

    return {
      country,
      latestGlobal,
      cards: cards.sort((a, b) => a.karatLabel.localeCompare(b.karatLabel, undefined, { numeric: true })),
      lastUpdatedAt: snapshots[0]?.capturedAt ?? null
    };
  } catch (error) {
    logMarketError(`overview:${countrySlug}`, error);
    return null;
  }
}

export async function getPricePageData(countrySlug: string, karatLabel: string) {
  try {
    const cached = await getCachedPricePageData(countrySlug, karatLabel);
    if (cached) return cached;

    const country = await getCountryBySlug(countrySlug);
    if (!country) return null;

    const [series, latestGlobal, contentPages, faqs, articles] = await Promise.all([
      db.goldPriceSnapshot.findMany({
        where: { countryId: country.id, karatLabel, sourceKind: "STORE" },
        orderBy: { capturedAt: "desc" },
        take: 240,
        include: { store: true }
      }),
      db.globalGoldPrice.findFirst({ where: { countryId: country.id }, orderBy: { capturedAt: "desc" } }),
      db.contentPage.findMany({
        where: {
          countryId: country.id,
          status: ContentStatus.PUBLISHED,
          OR: [
            { type: "GUIDE" },
            { type: "MARKET_ANALYSIS" },
            { type: "KARAT" }
          ]
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
      })
    ]);

    if (!series.length) return null;

    const orderedSeries = [...series].reverse();
    const latestSnapshot = orderedSeries.at(-1)!;
    const recommendation = await evaluateRecommendation({
      countryId: country.id,
      karatLabel,
      snapshots: orderedSeries.map((item) => ({ id: item.id, pricePerGram: item.pricePerGram, capturedAt: item.capturedAt })),
      spotEstimateQarPerGram: latestGlobal ? decimalToNumber(latestGlobal.qarPerGramEstimate) : null
    });

    const chartData = orderedSeries.map((item) => ({
      label: formatDate(item.capturedAt, "MMM d"),
      timestamp: item.capturedAt.toISOString(),
      price: decimalToNumber(item.pricePerGram)
    }));

    const latestPrice = decimalToNumber(latestSnapshot.pricePerGram);
    const dayAgo = orderedSeries.at(Math.max(0, orderedSeries.length - 3)) ?? latestSnapshot;
    const weekAgo = orderedSeries.at(Math.max(0, orderedSeries.length - 15)) ?? latestSnapshot;
    const summary = buildMarketSummary({
      karatLabel,
      recommendation: recommendation
        ? {
            score: recommendation.score,
            confidenceBand: recommendation.confidenceBand,
            explanation: recommendation.explanation
          }
        : null,
      currentPrice: latestPrice,
      change7d: percentChange(latestPrice, decimalToNumber(weekAgo.pricePerGram)),
      premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null
    });

    return {
      country,
      latestGlobal,
      latestSnapshot,
      recommendation,
      summary,
      chartData,
      stats: {
        latestPrice,
        change24h: percentChange(latestPrice, decimalToNumber(dayAgo.pricePerGram)),
        change7d: percentChange(latestPrice, decimalToNumber(weekAgo.pricePerGram)),
        premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null,
        lastUpdatedAt: latestSnapshot.capturedAt,
        storeName: latestSnapshot.store?.name ?? "Primary tracked store"
      },
      seoSections: {
        contentPages,
        faqs,
        articles
      }
    };
  } catch (error) {
    logMarketError(`price:${countrySlug}:${karatLabel}`, error);
    return null;
  }
}

export async function getHistoryPageData(countrySlug: string, karatLabel: string) {
  try {
    const cached = await getCachedHistoryPageData(countrySlug, karatLabel);
    if (cached) return cached;

    const page = await getPricePageData(countrySlug, karatLabel);
    if (!page) return null;

    const recommendationHistory = await db.recommendation.findMany({
      where: { countryId: page.country.id, karatLabel },
      orderBy: { createdAt: "asc" },
      take: 90
    });

    const globalSeries = await db.globalGoldPrice.findMany({
      where: { countryId: page.country.id },
      orderBy: { capturedAt: "asc" },
      take: page.chartData.length
    });

    return {
      ...page,
      comparisonData: page.chartData.map((point, index) => {
        const spot = decimalToNumber(globalSeries[index]?.qarPerGramEstimate ?? 0);
        const premium = spot > 0 ? ((Number(point.price) - spot) / spot) * 100 : 0;

        return {
          ...point,
          spot,
          premium
        };
      }),
      recommendationHistory: recommendationHistory.map((item) => ({
        label: formatDate(item.createdAt, "MMM d"),
        score: item.score,
        recommendation: item.label
      }))
    };
  } catch (error) {
    logMarketError(`history:${countrySlug}:${karatLabel}`, error);
    return null;
  }
}

export async function getCountryHubData(countrySlug: string) {
  try {
    const cached = await getCachedCountryHubData(countrySlug);
    if (cached) return cached;

    const country = await db.country.findUnique({
      where: { slug: countrySlug },
      include: {
        cities: { where: { isActive: true }, include: { stores: true } },
        stores: true,
        contentPages: {
          where: { status: ContentStatus.PUBLISHED },
          take: 8,
          orderBy: { publishAt: "desc" }
        }
      }
    });

    if (!country) return null;

    const overview = await getMarketOverview(countrySlug);
    return {
      country,
      overview
    };
  } catch (error) {
    logMarketError(`country-hub:${countrySlug}`, error);
    return null;
  }
}

export async function getCityHubData(countrySlug: string, citySlug: string) {
  try {
    const country = await getCountryBySlug(countrySlug);
    if (!country) return null;

    const city = await db.city.findFirst({
      where: { countryId: country.id, slug: citySlug },
      include: { stores: true, contentPages: { where: { status: ContentStatus.PUBLISHED } } }
    });

    if (!city) return null;

    return { country, city };
  } catch (error) {
    logMarketError(`city-hub:${countrySlug}:${citySlug}`, error);
    return null;
  }
}

export async function getStorePageData(countrySlug: string, citySlug: string, storeSlug: string) {
  try {
    const country = await getCountryBySlug(countrySlug);
    if (!country) return null;

    const store = await db.store.findFirst({
      where: { countryId: country.id, slug: storeSlug },
      include: {
        city: true,
        affiliateLinks: { where: { isActive: true } },
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 40
        }
      }
    });

    if (!store || store.city?.slug !== citySlug) return null;

    return {
      country,
      store
    };
  } catch (error) {
    logMarketError(`store:${countrySlug}:${citySlug}:${storeSlug}`, error);
    return null;
  }
}

export async function getContentHubData() {
  try {
    const cached = await getCachedContentHubData();
    if (cached) return cached;

    const [articles, guides, faqs] = await Promise.all([
      db.blogArticle.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 12,
        include: { country: true }
      }),
      db.contentPage.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          type: { in: ["GUIDE", "MARKET_ANALYSIS", "LANDING"] }
        },
        orderBy: { publishAt: "desc" },
        take: 12,
        include: { country: true }
      }),
      db.faq.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        take: 12,
        include: { country: true }
      })
    ]);

    return { articles, guides, faqs };
  } catch (error) {
    logMarketError("content-hub", error);
    return { articles: [], guides: [], faqs: [] };
  }
}

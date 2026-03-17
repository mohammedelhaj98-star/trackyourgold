import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export type HomepageMarketData = {
  countryName: string;
  countrySlug: string;
  karatLabel: string;
  currencyCode: string;
  pricePerGram: number;
  capturedAt: Date | null;
  recommendationLabel: string | null;
  confidenceBand: string | null;
  summaryText: string | null;
  change24h: number | null;
  premiumVsSpot: number | null;
  spotEstimate: number | null;
  trendPoints: number[];
};

type CachedPricePayload = {
  country?: {
    slug?: string;
    name?: string;
    currencyCode?: string;
  };
  latestSnapshot?: {
    karatLabel?: string;
    pricePerGram?: number | string | { toNumber(): number };
    capturedAt?: string | Date | null;
  };
  recommendation?: {
    label?: string | null;
    confidenceBand?: string | null;
    summaryText?: string | null;
    metrics?: {
      change24h?: number | null;
      premiumVsSpot?: number | null;
    };
  } | null;
  chartData?: Array<{
    price?: number | string;
  }>;
  stats?: {
    change24h?: number | null;
    premiumVsSpot?: number | null;
  };
  latestGlobal?: {
    qarPerGramEstimate?: number | string | { toNumber(): number };
  } | null;
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value);
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function parseJson<T>(value: string | null | undefined) {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T) {
  return Promise.race<T>([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    })
  ]);
}

async function getCachedHomepageSnapshot() {
  const setting = await db.setting.findFirst({
    where: {
      key: {
        in: ["public.market.price.qatar.22K", "public.market.price.qatar.22k", "public.market.overview.qatar"]
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const payload = parseJson<CachedPricePayload>(setting?.value);
  if (!payload) return null;

  const latestPrice = payload.latestSnapshot?.pricePerGram;
  const pricePerGram = toNumber(latestPrice);
  if (!isValidNumber(pricePerGram)) return null;

  const trendPoints =
    payload.chartData
      ?.map((point) => toNumber(point.price))
      .filter((value) => Number.isFinite(value))
      .slice(-7) ?? [];

  return {
    countryName: payload.country?.name ?? "Qatar",
    countrySlug: payload.country?.slug ?? "qatar",
    karatLabel: payload.latestSnapshot?.karatLabel ?? "22K",
    currencyCode: payload.country?.currencyCode ?? "QAR",
    pricePerGram,
    capturedAt: toDate(payload.latestSnapshot?.capturedAt ?? null),
    recommendationLabel: payload.recommendation?.label ?? null,
    confidenceBand: payload.recommendation?.confidenceBand ?? null,
    summaryText: payload.recommendation?.summaryText ?? null,
    change24h: payload.recommendation?.metrics?.change24h ?? payload.stats?.change24h ?? null,
    premiumVsSpot: payload.recommendation?.metrics?.premiumVsSpot ?? payload.stats?.premiumVsSpot ?? null,
    spotEstimate: payload.latestGlobal?.qarPerGramEstimate != null ? toNumber(payload.latestGlobal.qarPerGramEstimate) : null,
    trendPoints
  } satisfies HomepageMarketData;
}

async function getRawHomepageSnapshot() {
  const country = await db.country.findFirst({
    where: {
      OR: [{ slug: "qatar" }, { code: "QA" }]
    },
    select: {
      id: true,
      slug: true,
      name: true,
      currencyCode: true
    }
  });

  if (!country) return null;

  const preferredKarats = ["22K", "22k", "22 K", "22"];

  const [latestRecommendation, latestSnapshot, latestGlobalPrice, recentSnapshots] = await Promise.all([
    db.recommendation.findFirst({
      where: {
        countryId: country.id,
        karatLabel: { in: preferredKarats }
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        label: true,
        confidenceBand: true,
        summaryText: true,
        change24h: true,
        premiumVsSpot: true,
        snapshot: {
          select: {
            karatLabel: true,
            currencyCode: true,
            pricePerGram: true,
            capturedAt: true
          }
        }
      }
    }),
    db.goldPriceSnapshot.findFirst({
      where: {
        countryId: country.id,
        OR: [
          { karatLabel: { in: preferredKarats } },
          { karatLabel: { contains: "22" } }
        ]
      },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      select: {
        karatLabel: true,
        currencyCode: true,
        pricePerGram: true,
        capturedAt: true
      }
    }),
    db.globalGoldPrice.findFirst({
      where: { countryId: country.id },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      select: {
        qarPerGramEstimate: true
      }
    }),
    db.goldPriceSnapshot.findMany({
      where: {
        countryId: country.id,
        OR: [
          { karatLabel: { in: preferredKarats } },
          { karatLabel: { contains: "22" } }
        ]
      },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      take: 7,
      select: {
        pricePerGram: true
      }
    })
  ]);

  const fallbackLatestSnapshot =
    latestSnapshot ??
    (await db.goldPriceSnapshot.findFirst({
      where: { countryId: country.id },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      select: {
        karatLabel: true,
        currencyCode: true,
        pricePerGram: true,
        capturedAt: true
      }
    }));

  const snapshot = latestRecommendation?.snapshot ?? fallbackLatestSnapshot;
  if (!snapshot) return null;

  const pricePerGram = toNumber(snapshot.pricePerGram);
  if (!isValidNumber(pricePerGram)) return null;

  const spotEstimate = latestGlobalPrice ? toNumber(latestGlobalPrice.qarPerGramEstimate) : null;
  const recentValues = recentSnapshots
    .map((entry) => toNumber(entry.pricePerGram))
    .filter((value) => Number.isFinite(value))
    .reverse();
  const fallbackChange =
    recentValues.length >= 2 ? Number((recentValues[recentValues.length - 1] - recentValues[0]).toFixed(2)) : null;
  const premiumVsSpot =
    latestRecommendation?.premiumVsSpot != null
      ? toNumber(latestRecommendation.premiumVsSpot)
      : spotEstimate != null
        ? Number((pricePerGram - spotEstimate).toFixed(2))
        : null;

  return {
    countryName: country.name,
    countrySlug: country.slug,
    karatLabel: snapshot.karatLabel,
    currencyCode: snapshot.currencyCode || country.currencyCode,
    pricePerGram,
    capturedAt: snapshot.capturedAt,
    recommendationLabel: latestRecommendation?.label ?? null,
    confidenceBand: latestRecommendation?.confidenceBand ?? null,
    summaryText: latestRecommendation?.summaryText ?? null,
    change24h: latestRecommendation?.change24h != null ? toNumber(latestRecommendation.change24h) : fallbackChange,
    premiumVsSpot,
    spotEstimate,
    trendPoints: recentValues
  } satisfies HomepageMarketData;
}

const getHomepageMarketDataCached = unstable_cache(
  async (): Promise<HomepageMarketData | null> => {
    if (!hasDatabaseConfig()) return null;

    return withTimeout(
      (async () => {
        try {
          const cachedSnapshot = await getCachedHomepageSnapshot();
          if (cachedSnapshot) return cachedSnapshot;

          return await getRawHomepageSnapshot();
        } catch {
          return null;
        }
      })(),
      1500,
      null
    );
  },
  ["homepage-market-data"],
  {
    revalidate: 300,
    tags: ["homepage-market"]
  }
);

export async function getHomepageMarketData() {
  return getHomepageMarketDataCached();
}

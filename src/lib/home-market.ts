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

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value);
}

const getHomepageMarketDataCached = unstable_cache(
  async (): Promise<HomepageMarketData | null> => {
    if (!hasDatabaseConfig()) return null;

    try {
      const country = await db.country.findUnique({
        where: { slug: "qatar" },
        select: {
          id: true,
          slug: true,
          name: true,
          currencyCode: true
        }
      });

      if (!country) return null;

      const [latestRecommendation, latestSnapshot, latestGlobalPrice, recentSnapshots] = await Promise.all([
        db.recommendation.findFirst({
          where: {
            countryId: country.id,
            karatLabel: "22K"
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
            karatLabel: "22K"
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
            karatLabel: "22K"
          },
          orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
          take: 7,
          select: {
            pricePerGram: true
          }
        })
      ]);

      const snapshot = latestRecommendation?.snapshot ?? latestSnapshot;
      if (!snapshot) return null;

      const pricePerGram = toNumber(snapshot.pricePerGram);
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
        change24h:
          latestRecommendation?.change24h != null ? toNumber(latestRecommendation.change24h) : fallbackChange,
        premiumVsSpot,
        spotEstimate,
        trendPoints: recentValues
      };
    } catch {
      return null;
    }
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

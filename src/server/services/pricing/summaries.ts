import "server-only";

import type { Recommendation } from "@prisma/client";

import { decimalToNumber } from "@/lib/utils";

export function buildMarketSummary(input: {
  karatLabel: string;
  recommendation: Pick<Recommendation, "score" | "confidenceBand" | "explanation"> | null;
  currentPrice: number;
  change7d: number;
  premiumVsSpot: number | null;
}) {
  const direction = input.change7d > 0.4 ? "rose" : input.change7d < -0.4 ? "declined" : "moved sideways";
  const premiumText =
    input.premiumVsSpot === null
      ? "Spot comparison is temporarily unavailable, so the signal leans more heavily on local trend data."
      : input.premiumVsSpot > 7
        ? `Store premium is currently wide at roughly ${input.premiumVsSpot.toFixed(2)}% above the spot-derived estimate.`
        : `Store premium is relatively contained at roughly ${input.premiumVsSpot.toFixed(2)}% above the spot-derived estimate.`;
  const recommendationText = input.recommendation
    ? `${input.karatLabel} currently scores ${input.recommendation.score}/100 with ${input.recommendation.confidenceBand.toLowerCase()} conviction.`
    : `${input.karatLabel} does not yet have a stored recommendation record, so the page is showing calculated trend context only.`;

  return `${input.karatLabel} in Qatar ${direction} over the past week and now sits around QAR ${input.currentPrice.toFixed(2)} per gram. ${premiumText} ${recommendationText}`;
}

export function buildWeeklySummary(input: {
  karatLabel: string;
  latestRate: { pricePerGram: { toString(): string } | number };
  change7d: number;
  change30d: number;
  premiumVsSpot: number | null;
  recommendationLabel: string;
}) {
  return {
    subject: `${input.karatLabel} weekly summary from TrackYourGold`,
    preview: `${input.karatLabel} is ${input.change7d >= 0 ? "up" : "down"} ${Math.abs(input.change7d).toFixed(2)}% over 7 days.`,
    body: `${input.karatLabel} is currently QAR ${decimalToNumber(input.latestRate.pricePerGram).toFixed(2)} per gram. 7-day change: ${input.change7d.toFixed(2)}%. 30-day change: ${input.change30d.toFixed(2)}%. Recommendation: ${input.recommendationLabel}. Premium vs spot: ${input.premiumVsSpot?.toFixed(2) ?? "n/a"}%.`
  };
}

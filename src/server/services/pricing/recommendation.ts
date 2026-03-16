import "server-only";

import { RecommendationLabel } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber, percentChange } from "@/lib/utils";

type SnapshotPoint = {
  id: string;
  pricePerGram: { toString(): string } | number;
  capturedAt: Date;
};

type RecommendationReasonResult = {
  code: string;
  weight: number;
  value: number;
  direction: "positive" | "negative" | "neutral";
  reason: string;
};

type RecommendationResult = {
  label: RecommendationLabel;
  score: number;
  reasons: RecommendationReasonResult[];
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

const defaultThresholds = {
  strongBuy: 75,
  buy: 55,
  wait: 35,
  spikePenaltyPct: 1.25,
  premiumPenaltyPct: 7,
  drop24hPct: -0.75
};

const defaultWeights = {
  below30d: 18,
  below90d: 24,
  drop24h: 14,
  low90d: 18,
  momentum: 8,
  volatilityPenalty: 8,
  premiumPenalty: 10
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function computeLabel(score: number, thresholds = defaultThresholds) {
  if (score >= thresholds.strongBuy) return RecommendationLabel.STRONG_BUY;
  if (score >= thresholds.buy) return RecommendationLabel.BUY;
  if (score >= thresholds.wait) return RecommendationLabel.WAIT;
  return RecommendationLabel.AVOID;
}

export async function getRecommendationConfig() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ["recommendation.weights", "recommendation.thresholds"]
        }
      }
    });

    const weightsSetting = settings.find((setting) => setting.key === "recommendation.weights");
    const thresholdsSetting = settings.find((setting) => setting.key === "recommendation.thresholds");

    return {
      weights: weightsSetting ? { ...defaultWeights, ...JSON.parse(weightsSetting.value) } : defaultWeights,
      thresholds: thresholdsSetting ? { ...defaultThresholds, ...JSON.parse(thresholdsSetting.value) } : defaultThresholds
    };
  } catch (error) {
    console.error("[recommendation:config]", error);
    return {
      weights: defaultWeights,
      thresholds: defaultThresholds
    };
  }
}

export async function evaluateRecommendation(input: {
  countryId: string;
  karatLabel: string;
  snapshots: SnapshotPoint[];
  spotEstimateQarPerGram: number | null;
}) : Promise<RecommendationResult | null> {
  if (!input.snapshots.length) return null;

  const { weights, thresholds } = await getRecommendationConfig();
  const ordered = [...input.snapshots].sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());
  const prices = ordered.map((point) => decimalToNumber(point.pricePerGram));
  const currentPrice = prices.at(-1) ?? 0;
  const prev24h = prices.at(-3) ?? prices.at(-2) ?? currentPrice;
  const prev7d = prices.at(-15) ?? prices[0] ?? currentPrice;
  const trailing30 = prices.slice(-60);
  const trailing90 = prices.slice(-180);
  const avg30d = average(trailing30);
  const avg90d = average(trailing90.length ? trailing90 : prices);
  const low90d = Math.min(...(trailing90.length ? trailing90 : prices));
  const high90d = Math.max(...(trailing90.length ? trailing90 : prices));
  const returns = prices.slice(1).map((value, index) => percentChange(value, prices[index]));
  const volatility = standardDeviation(returns.slice(-30));
  const change24h = percentChange(currentPrice, prev24h);
  const change7d = percentChange(currentPrice, prev7d);
  const premiumVsSpot = input.spotEstimateQarPerGram
    ? percentChange(currentPrice, input.spotEstimateQarPerGram)
    : null;

  let score = 50;
  const reasons: RecommendationReasonResult[] = [];

  if (currentPrice < avg30d) {
    score += weights.below30d;
    reasons.push({
      code: "below_30d_average",
      weight: weights.below30d,
      value: avg30d - currentPrice,
      direction: "positive",
      reason: `${input.karatLabel} is trading below its 30-day average.`
    });
  }

  if (currentPrice < avg90d) {
    score += weights.below90d;
    reasons.push({
      code: "below_90d_average",
      weight: weights.below90d,
      value: avg90d - currentPrice,
      direction: "positive",
      reason: `${input.karatLabel} is below its 90-day average, improving long-horizon value.`
    });
  }

  if (change24h <= thresholds.drop24hPct) {
    score += weights.drop24h;
    reasons.push({
      code: "24h_drop",
      weight: weights.drop24h,
      value: change24h,
      direction: "positive",
      reason: `${input.karatLabel} declined meaningfully over the last 24 hours.`
    });
  }

  if (currentPrice <= low90d * 1.01) {
    score += weights.low90d;
    reasons.push({
      code: "near_90d_low",
      weight: weights.low90d,
      value: currentPrice - low90d,
      direction: "positive",
      reason: `${input.karatLabel} is close to its 90-day low.`
    });
  }

  if (change24h >= thresholds.spikePenaltyPct) {
    score -= weights.momentum;
    reasons.push({
      code: "sharp_spike",
      weight: weights.momentum,
      value: change24h,
      direction: "negative",
      reason: `${input.karatLabel} has spiked recently, which usually weakens entry quality.`
    });
  }

  if (premiumVsSpot !== null && premiumVsSpot >= thresholds.premiumPenaltyPct) {
    score -= weights.premiumPenalty;
    reasons.push({
      code: "premium_vs_spot",
      weight: weights.premiumPenalty,
      value: premiumVsSpot,
      direction: "negative",
      reason: `Store premium versus the spot-derived benchmark is wider than preferred.`
    });
  } else if (premiumVsSpot !== null) {
    reasons.push({
      code: "premium_vs_spot",
      weight: weights.premiumPenalty,
      value: premiumVsSpot,
      direction: "positive",
      reason: `Store premium versus the spot-derived benchmark is inside the preferred band.`
    });
  }

  if (volatility > 1.2) {
    score -= weights.volatilityPenalty;
    reasons.push({
      code: "elevated_volatility",
      weight: weights.volatilityPenalty,
      value: volatility,
      direction: "negative",
      reason: "Recent volatility is elevated, so patience is sensible unless you are averaging in." 
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = computeLabel(score, thresholds);
  const confidenceBand = score >= 75 ? "High" : score >= 55 ? "Moderate" : score >= 35 ? "Balanced" : "Defensive";
  const explanation =
    label === RecommendationLabel.STRONG_BUY
      ? `${input.karatLabel} screens well versus its trailing averages and recent momentum is not showing an overheated spike.`
      : label === RecommendationLabel.BUY
        ? `${input.karatLabel} is reasonably priced for buyers who are comfortable with normal market noise.`
        : label === RecommendationLabel.WAIT
          ? `${input.karatLabel} does not yet show a strong enough value edge. Waiting for softer pricing or a narrower premium may help.`
          : `${input.karatLabel} looks stretched or unstable relative to its recent history, so patience is preferred.`;

  const summaryText = `${input.karatLabel} scored ${score}/100. 24-hour change is ${change24h.toFixed(2)}%, 7-day change is ${change7d.toFixed(2)}%, and premium vs spot is ${premiumVsSpot?.toFixed(2) ?? "n/a"}%.`;

  return {
    label,
    score,
    reasons,
    explanation,
    confidenceBand,
    summaryText,
    metrics: {
      currentPrice,
      change24h,
      change7d,
      avg30d,
      avg90d,
      low90d,
      high90d,
      premiumVsSpot,
      volatility
    }
  };
}

export async function persistRecommendation(input: {
  countryId: string;
  karatLabel: string;
  snapshotId: string;
  recommendation: RecommendationResult;
}) {
  const record = await db.recommendation.create({
    data: {
      countryId: input.countryId,
      snapshotId: input.snapshotId,
      karatLabel: input.karatLabel,
      label: input.recommendation.label,
      score: input.recommendation.score,
      confidenceBand: input.recommendation.confidenceBand,
      explanation: input.recommendation.explanation,
      summaryText: input.recommendation.summaryText,
      modelVersion: "weighted-v1",
      premiumVsSpot: input.recommendation.metrics.premiumVsSpot,
      change24h: input.recommendation.metrics.change24h,
      change7d: input.recommendation.metrics.change7d,
      priceVs30d: input.recommendation.metrics.currentPrice - input.recommendation.metrics.avg30d,
      priceVs90d: input.recommendation.metrics.currentPrice - input.recommendation.metrics.avg90d
    }
  });

  if (input.recommendation.reasons.length) {
    await db.recommendationReason.createMany({
      data: input.recommendation.reasons.map((reason) => ({
        recommendationId: record.id,
        code: reason.code,
        weight: reason.weight,
        value: reason.value,
        direction: reason.direction,
        reason: reason.reason
      }))
    });
  }

  return record;
}

export type TierKey = "starter" | "builder" | "keeper" | "treasury" | "legacy";

export type TierProgress = {
  currentTier: TierKey;
  nextTier: TierKey | null;
  gramsToNextTier: number;
  tierProgressPct: number;
};

const TIER_STEPS = [
  { name: "starter", min: 0, max: 24.99 },
  { name: "builder", min: 25, max: 74.99 },
  { name: "keeper", min: 75, max: 199.99 },
  { name: "treasury", min: 200, max: 499.99 },
  { name: "legacy", min: 500, max: Number.POSITIVE_INFINITY }
] as const;

const TAG_SUGGESTIONS = ["Jewelry", "Coin", "Bar", "Gift", "Wedding", "Investment"] as const;

export function derivePriceFrom24k(price24k: number, karat: number) {
  return Number((price24k * (karat / 24)).toFixed(4));
}

export function computeFineGoldGrams(grams: number, karat: number) {
  return Number((grams * (karat / 24)).toFixed(4));
}

export function getSuggestedTags() {
  return [...TAG_SUGGESTIONS];
}

export function computeTierProgress(fineGoldGrams: number): TierProgress {
  const current =
    TIER_STEPS.find((step) => fineGoldGrams >= step.min && fineGoldGrams <= step.max) ?? TIER_STEPS[TIER_STEPS.length - 1];
  const nextIndex = TIER_STEPS.findIndex((step) => step.name === current.name) + 1;
  const next = TIER_STEPS[nextIndex] ?? null;

  if (!next) {
    return {
      currentTier: current.name,
      nextTier: null,
      gramsToNextTier: 0,
      tierProgressPct: 100
    };
  }

  const band = next.min - current.min;
  const progressed = fineGoldGrams - current.min;

  return {
    currentTier: current.name,
    nextTier: next.name,
    gramsToNextTier: Number(Math.max(next.min - fineGoldGrams, 0).toFixed(2)),
    tierProgressPct: Math.max(0, Math.min(100, Number(((progressed / band) * 100).toFixed(1))))
  };
}

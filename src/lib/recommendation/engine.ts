import { recommendationDefaults } from '@/lib/config/appConfig';

export type SignalInput = {
  below30DayAvg: boolean;
  below90DayAvg: boolean;
  drop24hPercent: number;
  is90DayLow: boolean;
  spike24hPercent: number;
  premiumOverSpotPercent: number;
};

export function buildRecommendation(input: SignalInput) {
  const w = recommendationDefaults.weights;
  const t = recommendationDefaults.thresholds;
  let score = 50;
  const reasons: string[] = [];

  if (input.below30DayAvg) { score += w.below30DayAvg; reasons.push('Price is below 30-day average.'); }
  if (input.below90DayAvg) { score += w.below90DayAvg; reasons.push('Price is below 90-day average.'); }
  if (input.drop24hPercent >= t.drop24hPercent) { score += w.drop24h; reasons.push('Significant 24-hour decline detected.'); }
  if (input.is90DayLow) { score += w.is90DayLow; reasons.push('New 90-day low can indicate favorable entry.'); }
  if (input.spike24hPercent >= t.spike24hPercent) { score += w.spikePenalty; reasons.push('Recent spike suggests caution.'); }
  if (input.premiumOverSpotPercent >= t.highPremiumPercent) { score += w.premiumOverSpotPenalty; reasons.push('Store premium over spot is wider than normal.'); }

  score = Math.max(0, Math.min(100, score));
  const label = score >= 80 ? 'STRONG_BUY' : score >= 65 ? 'BUY' : score >= 40 ? 'WAIT' : 'AVOID';

  return {
    label,
    score,
    reasons,
    explanation: `Current score is ${score}/100 based on trend, volatility, and premium behavior.`,
    confidenceNote: 'Informational confidence only; not guaranteed investment advice.',
  };
}

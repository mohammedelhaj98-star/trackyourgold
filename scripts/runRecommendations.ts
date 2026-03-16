import { buildRecommendation } from '@/lib/recommendation/engine';

console.log(buildRecommendation({
  below30DayAvg: true,
  below90DayAvg: true,
  drop24hPercent: 1.5,
  is90DayLow: false,
  spike24hPercent: 0.2,
  premiumOverSpotPercent: 4,
}));

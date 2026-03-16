import { buildRecommendation } from '@/lib/recommendation/engine';
import { prisma } from '@/lib/db/prisma';

export type PricePoint = {
  karatCode: string;
  pricePerGram: number;
  scrapeTimestamp: string;
};

export type MarketView = {
  countryCode: string;
  source: 'database' | 'demo';
  prices: PricePoint[];
  globalQarPerGram: number;
  premiumPercentByKarat: Record<string, number>;
  recommendation: ReturnType<typeof buildRecommendation>;
};

const demoPrices: PricePoint[] = [
  { karatCode: '24KT', pricePerGram: 305.5, scrapeTimestamp: new Date().toISOString() },
  { karatCode: '22KT', pricePerGram: 280.75, scrapeTimestamp: new Date().toISOString() },
  { karatCode: '21KT', pricePerGram: 268.35, scrapeTimestamp: new Date().toISOString() },
  { karatCode: '18KT', pricePerGram: 230.1, scrapeTimestamp: new Date().toISOString() },
];

function buildDemoMarketView(countryCode='QA'): MarketView {
  const globalQarPerGram = 292.3;
  const premiumPercentByKarat = Object.fromEntries(
    demoPrices.map((p) => [p.karatCode, Number((((p.pricePerGram - globalQarPerGram) / globalQarPerGram) * 100).toFixed(2))]),
  );
  return {
    countryCode,
    source: 'demo',
    prices: demoPrices,
    globalQarPerGram,
    premiumPercentByKarat,
    recommendation: buildRecommendation({
      below30DayAvg: true,
      below90DayAvg: false,
      drop24hPercent: 1.2,
      is90DayLow: false,
      spike24hPercent: 0.3,
      premiumOverSpotPercent: premiumPercentByKarat['24KT'] ?? 4,
    }),
  };
}

export async function getLatestMarketView(countryCode = 'QA'): Promise<MarketView> {
  if (!process.env.DATABASE_URL) {
    return buildDemoMarketView(countryCode);
  }

  const latest = await prisma.goldPriceSnapshot.findMany({
    where: { countryCode },
    orderBy: { scrapeTimestamp: 'desc' },
    distinct: ['karatCode'],
    take: 8,
  });

  if (!latest.length) {
    return buildDemoMarketView(countryCode);
  }

  const global = await prisma.globalGoldPrice.findFirst({ orderBy: { capturedAt: 'desc' } });
  const fx = await prisma.exchangeRate.findFirst({
    where: { fromCurrency: 'USD', toCurrency: 'QAR' },
    orderBy: { capturedAt: 'desc' },
  });

  const globalQarPerGram = global && fx ? Number(((Number(global.xauUsd) * Number(fx.rate)) / 31.1034768).toFixed(3)) : 292.3;

  const prices = latest.map((l) => ({
    karatCode: l.karatCode,
    pricePerGram: Number(l.pricePerGram),
    scrapeTimestamp: l.scrapeTimestamp.toISOString(),
  }));

  const premiumPercentByKarat = Object.fromEntries(
    prices.map((p) => [p.karatCode, Number((((p.pricePerGram - globalQarPerGram) / globalQarPerGram) * 100).toFixed(2))]),
  );

  const recommendation = buildRecommendation({
    below30DayAvg: true,
    below90DayAvg: true,
    drop24hPercent: 1.5,
    is90DayLow: false,
    spike24hPercent: 0.2,
    premiumOverSpotPercent: premiumPercentByKarat['24KT'] ?? 4,
  });

  return {
    countryCode,
    source: 'database',
    prices,
    globalQarPerGram,
    premiumPercentByKarat,
    recommendation,
  };
}

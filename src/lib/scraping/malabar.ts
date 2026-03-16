import { getEnv } from '@/lib/config/env';

export const parserVersion = 'malabar-v1';

export const malabarSelectors = {
  row: '.gold-rate-row',
  karat: '.karat-label',
  price: '.price-value',
  timestamp: '.updated-at',
};

export function getMalabarSources() {
  const env = getEnv();
  return {
    ratePageUrl: env.MALABAR_URL,
    storesPageUrl: env.MALABAR_STORES_URL,
  };
}

export async function scrapeMalabarHtml(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'TrackYourGoldBot/1.0' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to scrape Malabar: ${res.status}`);
  return res.text();
}

export function parseMalabarRates(html: string) {
  const rows = [...html.matchAll(/(\d{2})\s*KT[^\d]*(\d+(?:\.\d+)?)/gi)];
  const rates = rows.map((r) => ({ karatCode: `${r[1]}KT`, pricePerGram: Number(r[2]) }));
  return rates;
}

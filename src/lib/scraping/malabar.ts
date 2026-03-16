import { getEnv } from '@/lib/config/env';

export const parserVersion = 'malabar-v2';

export const malabarSelectors = {
  row: '.gold-rate-row',
  karat: '.karat-label',
  price: '.price-value',
  timestamp: '.updated-at',
  jsonScripts: 'script[type="application/ld+json"], script[type="application/json"]',
};

export type ParsedRate = {
  karatCode: string;
  pricePerGram: number;
};

export type ParsedMalabarPayload = {
  rates: ParsedRate[];
  pageTimestamp?: string;
};

export function getMalabarSources() {
  const env = getEnv();
  return {
    ratePageUrl: env.MALABAR_URL,
    storesPageUrl: env.MALABAR_STORES_URL,
  };
}

export async function scrapeMalabarHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.malabargoldanddiamonds.com/',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed to scrape Malabar: ${res.status}`);
  return res.text();
}

function normalizeKarat(raw: string) {
  const m = raw.match(/(\d{2})\s*(?:k|kt|karat)?/i);
  return m ? `${m[1]}KT` : raw.toUpperCase().replace(/\s+/g, '');
}

function tryParseRatesFromText(html: string): ParsedRate[] {
  const matches = [
    ...html.matchAll(/(\d{2})\s*(?:k|kt|karat)[^\d]{0,40}(\d{2,5}(?:\.\d{1,3})?)/gi),
    ...html.matchAll(/(\d{2})\s*(?:k|kt|karat)[\s\S]{0,120}?(?:QAR|QR|Q\.R\.)[^\d]{0,10}(\d{2,5}(?:\.\d{1,3})?)/gi),
  ];

  return matches
    .map((m) => ({ karatCode: normalizeKarat(m[1]), pricePerGram: Number(m[2]) }))
    .filter((r) => Number.isFinite(r.pricePerGram) && r.pricePerGram > 0);
}

function tryParseRatesFromJsonScripts(html: string): ParsedRate[] {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/(?:ld\+json|json)["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const rows: ParsedRate[] = [];

  for (const s of scripts) {
    const body = s[1];
    const local = [
      ...body.matchAll(/(?:"|')?(\d{2})\s*(?:K|KT|karat)(?:"|')?[^\d]{0,50}(\d{2,5}(?:\.\d{1,3})?)/gi),
      ...body.matchAll(/(?:"|')?(?:rate|price|amount)(?:"|')?\s*:\s*(\d{2,5}(?:\.\d{1,3})?)[\s\S]{0,80}(\d{2})\s*(?:K|KT)/gi),
    ];

    local.forEach((m) => {
      const karat = m[1]?.length === 2 ? m[1] : m[2];
      const price = m[2]?.length !== 2 ? m[2] : m[1];
      if (!karat || !price) return;
      rows.push({ karatCode: normalizeKarat(karat), pricePerGram: Number(price) });
    });
  }

  return rows.filter((r) => Number.isFinite(r.pricePerGram) && r.pricePerGram > 0);
}

function dedupeRates(rates: ParsedRate[]): ParsedRate[] {
  const map = new Map<string, number>();
  for (const r of rates) {
    // keep latest/highest parsed value if duplicated
    map.set(r.karatCode, Math.max(map.get(r.karatCode) ?? 0, r.pricePerGram));
  }
  return [...map.entries()]
    .map(([karatCode, pricePerGram]) => ({ karatCode, pricePerGram }))
    .sort((a, b) => Number(b.karatCode.replace('KT', '')) - Number(a.karatCode.replace('KT', '')));
}

function extractPageTimestamp(html: string): string | undefined {
  const m = html.match(/(?:updated|last\s*updated|as\s*on)\s*[:\-]?\s*([A-Za-z0-9,\-:\s]{8,40})/i);
  return m?.[1]?.trim();
}

export function parseMalabarRates(html: string): ParsedMalabarPayload {
  const fromJson = tryParseRatesFromJsonScripts(html);
  const fromText = tryParseRatesFromText(html);
  const rates = dedupeRates([...fromJson, ...fromText]);
  return { rates, pageTimestamp: extractPageTimestamp(html) };
}

export async function scrapeAndParseMalabar() {
  const sources = getMalabarSources();
  const tried: string[] = [];

  for (const url of [sources.ratePageUrl, sources.storesPageUrl]) {
    tried.push(url);
    const html = await scrapeMalabarHtml(url);
    const parsed = parseMalabarRates(html);
    if (parsed.rates.length > 0) {
      return { ...parsed, sourceUrl: url, html };
    }
  }

  throw new Error(`Unable to parse Malabar rates from configured sources: ${tried.join(', ')}`);
}

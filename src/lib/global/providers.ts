import { getEnv } from '@/lib/config/env';

export type GlobalReferenceQuote = {
  xauUsd: number;
  usdQar: number;
  qarPerGram: number;
  provider: string;
  capturedAt: string;
  degraded: boolean;
};

const TROY_OUNCE_GRAMS = 31.1034768;

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function primaryMetalsDev(): Promise<number> {
  const data = await fetchJson('https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=toz&symbols=XAU');
  const xau = Number(data?.metals?.XAU ?? data?.rates?.XAU);
  if (!xau || Number.isNaN(xau)) throw new Error('Invalid XAU from primary');
  return xau;
}

async function backupGoldApi(): Promise<number> {
  const data = await fetchJson('https://data-asg.goldprice.org/dbXRates/USD');
  const xau = Number(data?.items?.[0]?.xauPrice);
  if (!xau || Number.isNaN(xau)) throw new Error('Invalid XAU from backup');
  return xau;
}

async function primaryFx(): Promise<number> {
  const data = await fetchJson('https://api.exchangerate.host/latest?base=USD&symbols=QAR');
  const qar = Number(data?.rates?.QAR);
  if (!qar || Number.isNaN(qar)) throw new Error('Invalid USD/QAR from primary fx');
  return qar;
}

async function backupFx(): Promise<number> {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  const qar = Number(data?.rates?.QAR);
  if (!qar || Number.isNaN(qar)) throw new Error('Invalid USD/QAR from backup fx');
  return qar;
}

export async function getGlobalReferenceQuote(): Promise<GlobalReferenceQuote> {
  const env = getEnv();
  let degraded = false;
  let xauUsd: number;
  let usdQar: number;

  try {
    xauUsd = env.GOLD_PROVIDER_PRIMARY === 'metalsdev' ? await primaryMetalsDev() : await backupGoldApi();
  } catch {
    xauUsd = await backupGoldApi();
    degraded = true;
  }

  try {
    usdQar = env.FX_PROVIDER_PRIMARY === 'exchangerate-host' ? await primaryFx() : await backupFx();
  } catch {
    usdQar = await backupFx();
    degraded = true;
  }

  const qarPerGram = (xauUsd * usdQar) / TROY_OUNCE_GRAMS;

  return {
    xauUsd,
    usdQar,
    qarPerGram,
    provider: `${env.GOLD_PROVIDER_PRIMARY}+${env.FX_PROVIDER_PRIMARY}`,
    capturedAt: new Date().toISOString(),
    degraded,
  };
}

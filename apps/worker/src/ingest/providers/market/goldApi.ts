import type { MarketProvider, MarketProviderResult } from "./provider.js";
import { buildProviderUrl, normalizeProviderBaseUrl } from "./provider.js";

type GoldApiConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  qarPerUsd: number;
};

type GoldApiPayload = {
  timestamp?: number;
  currency?: string;
  price?: number | string;
  price_gram_24k?: number | string;
  price_gram_23k?: number | string;
  price_gram_22k?: number | string;
  price_gram_21k?: number | string;
  price_gram_18k?: number | string;
  price_gram_16k?: number | string;
  price_gram_14k?: number | string;
  price_gram_10k?: number | string;
};

const GRAMS_PER_TROY_OUNCE = 31.1034768;

function parseNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildUrl(baseUrl: string, baseCurrency: "QAR") {
  const normalized = normalizeProviderBaseUrl(baseUrl);
  if (/\/api\/[^/]+\/[^/]+/i.test(normalized)) {
    return buildProviderUrl(normalized);
  }

  return buildProviderUrl(`${normalized.replace(/\/+$/, "")}/api/XAU/${baseCurrency}`);
}

function convertToQar(value: number, sourceCurrency: string | undefined, qarPerUsd: number) {
  const normalized = sourceCurrency?.toUpperCase() ?? "QAR";

  if (normalized === "QAR") {
    return value;
  }

  if (normalized === "USD") {
    return value * qarPerUsd;
  }

  throw new Error(`Unsupported market currency ${normalized}`);
}

export class GoldApiProvider implements MarketProvider {
  constructor(private readonly config: GoldApiConfig) {}

  async getMarketCaratRates(baseCurrency: "QAR"): Promise<MarketProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const url = buildUrl(this.config.baseUrl, baseCurrency);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "x-access-token": this.config.apiKey,
          "content-type": "application/json"
        }
      });
      const rawBody = await response.text();
      const payload = JSON.parse(rawBody) as GoldApiPayload;

      const price24k = parseNumber(payload.price_gram_24k) ?? (parseNumber(payload.price) ? parseNumber(payload.price)! / GRAMS_PER_TROY_OUNCE : null);
      const price23k = parseNumber(payload.price_gram_23k);
      const price22k = parseNumber(payload.price_gram_22k) ?? (price24k ? price24k * (22 / 24) : null);
      const price21k = parseNumber(payload.price_gram_21k);
      const price18k = parseNumber(payload.price_gram_18k);
      const price14k = parseNumber(payload.price_gram_14k);
      const price10k = parseNumber(payload.price_gram_10k);

      if (!response.ok || !price24k || !price22k) {
        throw new Error(`Market provider error ${response.status}: missing usable gram prices`);
      }

      const toQar = (value: number) => convertToQar(value, payload.currency, this.config.qarPerUsd);
      const ratesByKarat = {
        "24K": toQar(price24k),
        "23K": toQar(price23k ?? price24k * (23 / 24)),
        "22K": toQar(price22k),
        "21K": toQar(price21k ?? price24k * (21 / 24)),
        "18K": toQar(price18k ?? price24k * (18 / 24)),
        "14K": toQar(price14k ?? price24k * (14 / 24)),
        "12K": toQar(price24k * (12 / 24)),
        "10K": toQar(price10k ?? price24k * (10 / 24)),
        "9K": toQar(price24k * (9 / 24)),
        "8K": toQar(price24k * (8 / 24))
      };

      return {
        asOf: payload.timestamp ? new Date(payload.timestamp * 1000) : new Date(),
        unit: "per_gram",
        ratesByKarat,
        rawBody,
        contentType: response.headers.get("content-type") ?? "application/json",
        status: response.status
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

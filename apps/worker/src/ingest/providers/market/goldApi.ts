import type { MarketProvider, MarketProviderResult } from "./provider.js";
import { buildProviderUrl, normalizeProviderBaseUrl } from "./provider.js";

type GoldApiConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
};

type GoldApiPayload = {
  timestamp?: number;
  price_gram_24k?: number;
  price_gram_23k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_18k?: number;
  price_gram_16k?: number;
  price_gram_14k?: number;
  price_gram_10k?: number;
};

function buildUrl(baseUrl: string, baseCurrency: "QAR") {
  const normalized = normalizeProviderBaseUrl(baseUrl);
  if (/\/api\/[^/]+\/[^/]+/i.test(normalized)) {
    return buildProviderUrl(normalized);
  }

  return buildProviderUrl(`${normalized.replace(/\/+$/, "")}/api/XAU/${baseCurrency}`);
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

      if (!response.ok || !payload.price_gram_24k || !payload.price_gram_22k) {
        throw new Error(`Market provider error ${response.status}`);
      }

      const ratesByKarat = {
        "24K": payload.price_gram_24k,
        "23K": payload.price_gram_23k ?? payload.price_gram_24k * (23 / 24),
        "22K": payload.price_gram_22k,
        "21K": payload.price_gram_21k ?? payload.price_gram_24k * (21 / 24),
        "18K": payload.price_gram_18k ?? payload.price_gram_24k * (18 / 24),
        "14K": payload.price_gram_14k ?? payload.price_gram_24k * (14 / 24),
        "12K": payload.price_gram_24k * (12 / 24),
        "10K": payload.price_gram_10k ?? payload.price_gram_24k * (10 / 24),
        "9K": payload.price_gram_24k * (9 / 24),
        "8K": payload.price_gram_24k * (8 / 24)
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

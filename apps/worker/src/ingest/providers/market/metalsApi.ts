import type { MarketProvider, MarketProviderResult } from "./provider.js";
import { buildProviderUrl } from "./provider.js";

type MetalsApiConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
};

function buildUrl(baseUrl: string) {
  const url = buildProviderUrl(baseUrl);
  url.searchParams.set("base", "QAR");
  url.searchParams.set("symbols", "XAU");
  return url;
}

export class MetalsApiProvider implements MarketProvider {
  constructor(private readonly config: MetalsApiConfig) {}

  async getMarketCaratRates(baseCurrency: "QAR"): Promise<MarketProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const url = buildUrl(this.config.baseUrl);
    url.searchParams.set("base", baseCurrency);
    url.searchParams.set("access_key", this.config.apiKey);

    try {
      const response = await fetch(url, { signal: controller.signal });
      const rawBody = await response.text();
      const payload = JSON.parse(rawBody) as {
        success?: boolean;
        timestamp?: number;
        rates?: Record<string, number>;
        price_gram_24k?: number;
      };

      const price24k = payload.price_gram_24k ?? payload.rates?.XAU;
      if (!response.ok || !price24k) {
        throw new Error(`Market provider error ${response.status}`);
      }

      const ratesByKarat = {
        "24K": price24k,
        "23K": price24k * (23 / 24),
        "22K": price24k * (22 / 24),
        "21K": price24k * (21 / 24),
        "18K": price24k * (18 / 24),
        "14K": price24k * (14 / 24),
        "12K": price24k * (12 / 24),
        "10K": price24k * (10 / 24),
        "9K": price24k * (9 / 24),
        "8K": price24k * (8 / 24)
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

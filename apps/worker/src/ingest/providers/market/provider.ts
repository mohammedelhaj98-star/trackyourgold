export type MarketProviderResult = {
  asOf: Date;
  unit: string;
  ratesByKarat: Record<string, number>;
  rawBody: string;
  contentType: string;
  status: number;
};

export type MarketProvider = {
  getMarketCaratRates(baseCurrency: "QAR"): Promise<MarketProviderResult>;
};

export function normalizeProviderBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/^https?:\/\//i, "");
}

export function buildProviderUrl(baseUrl: string) {
  return new URL(`https://${normalizeProviderBaseUrl(baseUrl)}`);
}

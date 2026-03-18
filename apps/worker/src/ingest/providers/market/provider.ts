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

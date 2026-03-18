export const DEFAULT_MARKET = "qatar";
export const DEFAULT_CURRENCY = "QAR";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_KARATS = [24, 23, 22, 21, 18, 14, 12, 10, 9, 8] as const;
export const ITEM_CATEGORIES = ["JEWELRY", "COIN", "BAR", "SCRAP", "OTHER"] as const;
export const VALUATION_MODES = ["intrinsic", "retail", "sell_est"] as const;
export const SOURCE_CODES = {
  market: "market_metalsapi",
  retail: "retail_malabar"
} as const;

import type { Decimal } from "decimal.js";

export type SupportedKarat = 24 | 23 | 22 | 21 | 18 | 14 | 12 | 10 | 9 | 8;
export type ItemCategory = "JEWELRY" | "COIN" | "BAR" | "SCRAP" | "OTHER";
export type ValuationMode = "intrinsic" | "retail" | "sell_est";

export type RateMap = Partial<Record<`${SupportedKarat}K`, Decimal.Value>>;

export type VaultItemInput = {
  id?: string;
  itemName: string;
  category: ItemCategory;
  purityKarat: SupportedKarat;
  grossWeightG: Decimal.Value;
  stoneWeightG?: Decimal.Value;
  netGoldWeightG?: Decimal.Value | null;
  purchaseTotalPriceQar: Decimal.Value;
};

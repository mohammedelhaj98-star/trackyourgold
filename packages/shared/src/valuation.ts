import { Decimal } from "decimal.js";

import { asDecimal, roundCurrency, roundWeight } from "./money.js";
import type { RateMap, SupportedKarat, VaultItemInput } from "./types.js";

export function purityFactor(karat: SupportedKarat) {
  return new Decimal(karat).div(24);
}

export function computeNetGoldWeight(gross: Decimal.Value, stone: Decimal.Value) {
  const value = asDecimal(gross).minus(asDecimal(stone));
  return roundWeight(Decimal.max(value, 0));
}

function resolveRateForKarat(rates: RateMap, karat: SupportedKarat) {
  const direct = rates[`${karat}K`];
  if (direct !== undefined) {
    return asDecimal(direct);
  }

  const base24 = rates["24K"];
  if (base24 === undefined) {
    throw new Error(`Missing ${karat}K and 24K rates.`);
  }

  return asDecimal(base24).mul(purityFactor(karat));
}

function resolveNetWeight(item: VaultItemInput) {
  if (item.netGoldWeightG !== undefined && item.netGoldWeightG !== null) {
    return roundWeight(item.netGoldWeightG);
  }

  return computeNetGoldWeight(item.grossWeightG, item.stoneWeightG ?? 0);
}

export function valueIntrinsic(item: VaultItemInput, marketRates: RateMap) {
  return roundCurrency(resolveRateForKarat(marketRates, item.purityKarat).mul(resolveNetWeight(item)));
}

export function valueRetail(item: VaultItemInput, retailRates: RateMap) {
  return roundCurrency(resolveRateForKarat(retailRates, item.purityKarat).mul(resolveNetWeight(item)));
}

export function valueSellEstimate(intrinsicValue: Decimal.Value, sellSpreadPct = 0.03) {
  return roundCurrency(asDecimal(intrinsicValue).mul(new Decimal(1).minus(sellSpreadPct)));
}

export function computePL(currentValue: Decimal.Value, purchaseTotalPriceQar: Decimal.Value) {
  return roundCurrency(asDecimal(currentValue).minus(asDecimal(purchaseTotalPriceQar)));
}

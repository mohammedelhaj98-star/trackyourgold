import { Decimal } from "decimal.js";

export function asDecimal(value: Decimal.Value) {
  return new Decimal(value);
}

export function roundCurrency(value: Decimal.Value) {
  return asDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function roundWeight(value: Decimal.Value) {
  return asDecimal(value).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
}

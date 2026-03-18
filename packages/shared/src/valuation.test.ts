import { Decimal } from "decimal.js";
import { describe, expect, it } from "vitest";

import { computeNetGoldWeight, computePL, purityFactor, valueIntrinsic, valueRetail, valueSellEstimate } from "./valuation.js";

describe("valuation", () => {
  it("computes purity factor", () => {
    expect(purityFactor(22).toNumber()).toBeCloseTo(22 / 24, 6);
  });

  it("clamps net gold weight at zero", () => {
    expect(computeNetGoldWeight(2, 3).toNumber()).toBe(0);
  });

  it("computes intrinsic value", () => {
    const value = valueIntrinsic(
      {
        itemName: "Bracelet",
        category: "JEWELRY",
        purityKarat: 22,
        grossWeightG: 10,
        stoneWeightG: 2,
        purchaseTotalPriceQar: 5000
      },
      { "22K": new Decimal(250) }
    );

    expect(value.toNumber()).toBe(2000);
  });

  it("falls back to retail 24K derivation", () => {
    const value = valueRetail(
      {
        itemName: "Coin",
        category: "COIN",
        purityKarat: 18,
        grossWeightG: 10,
        stoneWeightG: 0,
        purchaseTotalPriceQar: 3500
      },
      { "24K": 300 }
    );

    expect(value.toNumber()).toBe(2250);
  });

  it("applies sell spread and profit loss", () => {
    const sellEstimate = valueSellEstimate(1000, 0.03);
    const pl = computePL(sellEstimate, 800);

    expect(sellEstimate.toNumber()).toBe(970);
    expect(pl.toNumber()).toBe(170);
  });
});

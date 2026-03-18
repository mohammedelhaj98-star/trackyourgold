import { Decimal } from "decimal.js";
import type { PrismaClient, ValuationMode } from "@prisma/client";

import { computePL, minutesFromNow, valueIntrinsic, valueRetail, valueSellEstimate } from "@trackyourgold/shared";

import { ApiError } from "../lib/errors.js";
import { getLatestRateLayer, mapPriceRecord } from "../lib/pricing.js";

export async function getUserVaults(db: PrismaClient, userId: string) {
  return db.vault.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" }
  });
}

export async function createVault(db: PrismaClient, userId: string, name: string) {
  return db.vault.create({
    data: {
      ownerId: userId,
      name,
      defaultCurrency: "QAR"
    }
  });
}

export async function getOwnedVault(db: PrismaClient, userId: string, vaultId: string) {
  const vault = await db.vault.findFirst({
    where: { id: vaultId, ownerId: userId }
  });

  if (!vault) {
    throw new ApiError(404, "vault_not_found", "Vault not found.");
  }

  return vault;
}

export async function listVaultItems(db: PrismaClient, userId: string, vaultId: string) {
  await getOwnedVault(db, userId, vaultId);

  return db.vaultItem.findMany({
    where: { vaultId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createVaultItem(
  db: PrismaClient,
  userId: string,
  vaultId: string,
  input: {
    itemName: string;
    category: string;
    purityKarat: number;
    grossWeightG: number;
    stoneWeightG: number;
    purchaseDate: string;
    purchaseTotalPriceQar: number;
    makingChargesQar: number;
    vatQar: number;
    purchaseStoreName?: string | undefined;
    purchaseLocation?: string | undefined;
    purchaseNotes?: string | undefined;
  }
) {
  await getOwnedVault(db, userId, vaultId);

  const gross = new Decimal(input.grossWeightG);
  const stone = new Decimal(input.stoneWeightG);
  const net = Decimal.max(gross.minus(stone), 0);

  return db.vaultItem.create({
    data: {
      vaultId,
      itemName: input.itemName,
      category: input.category as never,
      purityKarat: input.purityKarat,
      grossWeightG: gross,
      stoneWeightG: stone,
      netGoldWeightG: net,
      purchaseDate: new Date(input.purchaseDate),
      purchaseTotalPriceQar: input.purchaseTotalPriceQar,
      makingChargesQar: input.makingChargesQar,
      vatQar: input.vatQar,
      purchaseStoreName: input.purchaseStoreName || null,
      purchaseLocation: input.purchaseLocation || null,
      purchaseNotes: input.purchaseNotes || null
    }
  });
}

export async function getOwnedItem(db: PrismaClient, userId: string, itemId: string) {
  const item = await db.vaultItem.findFirst({
    where: {
      id: itemId,
      vault: { ownerId: userId }
    }
  });

  if (!item) {
    throw new ApiError(404, "item_not_found", "Item not found.");
  }

  return item;
}

export async function updateVaultItem(
  db: PrismaClient,
  userId: string,
  itemId: string,
  input: {
    itemName?: string | undefined;
    category?: string | undefined;
    purityKarat?: number | undefined;
    grossWeightG?: number | undefined;
    stoneWeightG?: number | undefined;
    purchaseDate?: string | undefined;
    purchaseTotalPriceQar?: number | undefined;
    makingChargesQar?: number | undefined;
    vatQar?: number | undefined;
    purchaseStoreName?: string | undefined;
    purchaseLocation?: string | undefined;
    purchaseNotes?: string | undefined;
  }
) {
  const item = await getOwnedItem(db, userId, itemId);
  const gross = new Decimal(input.grossWeightG ?? item.grossWeightG.toString());
  const stone = new Decimal(input.stoneWeightG ?? item.stoneWeightG.toString());
  const net = Decimal.max(gross.minus(stone), 0);

  return db.vaultItem.update({
    where: { id: itemId },
    data: {
      itemName: input.itemName ?? item.itemName,
      category: (input.category ?? item.category) as never,
      purityKarat: input.purityKarat ?? item.purityKarat,
      grossWeightG: gross,
      stoneWeightG: stone,
      netGoldWeightG: net,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : item.purchaseDate,
      purchaseTotalPriceQar: input.purchaseTotalPriceQar ?? item.purchaseTotalPriceQar,
      makingChargesQar: input.makingChargesQar ?? item.makingChargesQar,
      vatQar: input.vatQar ?? item.vatQar,
      purchaseStoreName: input.purchaseStoreName ?? item.purchaseStoreName,
      purchaseLocation: input.purchaseLocation ?? item.purchaseLocation,
      purchaseNotes: input.purchaseNotes ?? item.purchaseNotes
    }
  });
}

export async function deleteVaultItem(db: PrismaClient, userId: string, itemId: string) {
  await getOwnedItem(db, userId, itemId);
  await db.vaultItem.delete({ where: { id: itemId } });
}

export async function getVaultValuation(
  db: PrismaClient,
  userId: string,
  vaultId: string,
  mode: ValuationMode,
  sellSpreadPct: number,
  cacheTtlSeconds: number
) {
  await getOwnedVault(db, userId, vaultId);

  const cache = await db.valuationCache.findUnique({
    where: {
      vaultId_mode: {
        vaultId,
        mode
      }
    }
  });

  if (cache && cache.expiresAt > new Date()) {
    return cache.payload;
  }

  const [items, market, retail] = await Promise.all([
    db.vaultItem.findMany({ where: { vaultId }, orderBy: { createdAt: "desc" } }),
    getLatestRateLayer(db, "market"),
    getLatestRateLayer(db, "retail").catch(() => null)
  ]);

  const marketRates = mapPriceRecord(market.price);
  const retailRates = retail ? mapPriceRecord(retail.price) : marketRates;

  let totalValue = new Decimal(0);
  let totalCost = new Decimal(0);

  const normalizedItems = items.map((item) => {
    const baseItem = {
      itemName: item.itemName,
      category: item.category,
      purityKarat: item.purityKarat as 24 | 23 | 22 | 21 | 18 | 14 | 12 | 10 | 9 | 8,
      grossWeightG: item.grossWeightG.toString(),
      stoneWeightG: item.stoneWeightG.toString(),
      netGoldWeightG: item.netGoldWeightG.toString(),
      purchaseTotalPriceQar: item.purchaseTotalPriceQar.toString()
    };

    const currentValue =
      mode === "intrinsic"
        ? valueIntrinsic(baseItem, marketRates)
        : mode === "retail"
          ? valueRetail(baseItem, retailRates)
          : valueSellEstimate(valueIntrinsic(baseItem, marketRates), sellSpreadPct);

    totalValue = totalValue.plus(currentValue);
    totalCost = totalCost.plus(item.purchaseTotalPriceQar);

    const pl = computePL(currentValue, item.purchaseTotalPriceQar);
    const plPct = item.purchaseTotalPriceQar.isZero()
      ? 0
      : pl.div(item.purchaseTotalPriceQar).mul(100).toDecimalPlaces(2).toNumber();

    return {
      itemId: item.id,
      itemName: item.itemName,
      karat: item.purityKarat,
      netWeightG: Number(item.netGoldWeightG),
      valueQar: Number(currentValue),
      plQar: Number(pl),
      plPct
    };
  });

  const totalPl = totalValue.minus(totalCost);
  const payload = {
    asOf: market.price.asOf,
    mode,
    totals: {
      totalValueQar: Number(totalValue.toDecimalPlaces(2)),
      totalCostQar: Number(totalCost.toDecimalPlaces(2)),
      totalPlQar: Number(totalPl.toDecimalPlaces(2)),
      totalPlPct: totalCost.isZero() ? 0 : Number(totalPl.div(totalCost).mul(100).toDecimalPlaces(2))
    },
    items: normalizedItems,
    sources: {
      marketAsOf: market.price.asOf,
      retailAsOf: retail?.price.asOf ?? null
    }
  };

  await db.valuationCache.upsert({
    where: { vaultId_mode: { vaultId, mode } },
    update: {
      payload,
      asOf: market.price.asOf,
      computedAt: new Date(),
      expiresAt: minutesFromNow(Math.max(1, Math.round(cacheTtlSeconds / 60)))
    },
    create: {
      vaultId,
      mode,
      payload,
      asOf: market.price.asOf,
      expiresAt: minutesFromNow(Math.max(1, Math.round(cacheTtlSeconds / 60)))
    }
  });

  return payload;
}

export async function getVaultValuationHistory(
  db: PrismaClient,
  userId: string,
  vaultId: string,
  mode: ValuationMode,
  days: number,
  sellSpreadPct: number
) {
  await getOwnedVault(db, userId, vaultId);
  const items = await db.vaultItem.findMany({ where: { vaultId } });
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [market, retail] = await Promise.all([
    db.priceNormalized.findMany({
      where: {
        source: { code: "market_metalsapi" },
        asOf: { gte: cutoff }
      },
      orderBy: { asOf: "asc" },
      take: 240
    }),
    db.priceNormalized.findMany({
      where: {
        source: { code: "retail_malabar" },
        asOf: { gte: cutoff }
      },
      orderBy: { asOf: "asc" },
      take: 240
    })
  ]);

  const retailByDate = new Map(retail.map((row) => [row.asOf.toISOString(), mapPriceRecord(row)]));

  return {
    points: market.map((row) => {
      const marketRates = mapPriceRecord(row);
      const retailRates = retailByDate.get(row.asOf.toISOString()) ?? marketRates;
      const total = items.reduce((sum, item) => {
        const baseItem = {
          itemName: item.itemName,
          category: item.category,
          purityKarat: item.purityKarat as 24 | 23 | 22 | 21 | 18 | 14 | 12 | 10 | 9 | 8,
          grossWeightG: item.grossWeightG.toString(),
          stoneWeightG: item.stoneWeightG.toString(),
          netGoldWeightG: item.netGoldWeightG.toString(),
          purchaseTotalPriceQar: item.purchaseTotalPriceQar.toString()
        };

        const value =
          mode === "intrinsic"
            ? valueIntrinsic(baseItem, marketRates)
            : mode === "retail"
              ? valueRetail(baseItem, retailRates)
              : valueSellEstimate(valueIntrinsic(baseItem, marketRates), sellSpreadPct);

        return sum.plus(value);
      }, new Decimal(0));

      return {
        asOf: row.asOf,
        totalValueQar: Number(total.toDecimalPlaces(2))
      };
    })
  };
}

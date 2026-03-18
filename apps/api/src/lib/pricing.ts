import type { RateMap } from "@trackyourgold/shared";
import type { PrismaClient } from "@prisma/client";

import { SOURCE_CODES } from "@trackyourgold/shared";

import { ApiError } from "./errors.js";

export async function getLatestRateLayer(db: PrismaClient, layer: "market" | "retail") {
  const sourceCode = layer === "market" ? SOURCE_CODES.market : SOURCE_CODES.retail;

  const source = await db.priceSource.findUnique({
    where: { code: sourceCode }
  });

  if (!source) {
    throw new ApiError(404, "source_missing", `Price source ${sourceCode} is not configured.`);
  }

  const price = await db.priceNormalized.findFirst({
    where: { sourceId: source.id },
    orderBy: { asOf: "desc" }
  });

  if (!price) {
    throw new ApiError(404, "rate_missing", `No normalized rates for ${sourceCode}.`);
  }

  return { source, price };
}

export function mapPriceRecord(price: {
  price24kPerGram: { toString(): string } | number;
  price23kPerGram: { toString(): string } | number | null;
  price22kPerGram: { toString(): string } | number;
  price21kPerGram: { toString(): string } | number | null;
  price18kPerGram: { toString(): string } | number | null;
  price14kPerGram: { toString(): string } | number | null;
  price12kPerGram: { toString(): string } | number | null;
  price10kPerGram: { toString(): string } | number | null;
  price9kPerGram: { toString(): string } | number | null;
  price8kPerGram: { toString(): string } | number | null;
}): RateMap {
  const result: RateMap = {
    "24K": Number(price.price24kPerGram),
    "22K": Number(price.price22kPerGram)
  };

  for (const [key, value] of Object.entries({
    "23K": price.price23kPerGram,
    "21K": price.price21kPerGram,
    "18K": price.price18kPerGram,
    "14K": price.price14kPerGram,
    "12K": price.price12kPerGram,
    "10K": price.price10kPerGram,
    "9K": price.price9kPerGram,
    "8K": price.price8kPerGram
  })) {
    if (value !== null && value !== undefined) {
      result[key as keyof RateMap] = Number(value);
    }
  }

  return result;
}

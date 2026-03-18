import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { db } from "../../db/prisma.js";

function digest(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

export async function storeRawSnapshot(sourceId: string, rawBody: string, contentType: string, httpStatus: number) {
  const payload = gzipSync(Buffer.from(rawBody, "utf8"));
  const blob = await db.rawSnapshotBlob.create({
    data: {
      encoding: "gzip",
      contentType,
      payload,
      sha256: digest(payload)
    }
  });

  return db.priceSnapshotRaw.create({
    data: {
      sourceId,
      blobId: blob.id,
      httpStatus,
      contentType
    }
  });
}

export async function persistNormalizedRates(input: {
  sourceId: string;
  asOf: Date;
  currency: string;
  unit: string;
  ratesByKarat: Record<string, number | null | undefined>;
  meta?: Prisma.InputJsonValue;
}) {
  return db.priceNormalized.create({
    data: {
      sourceId: input.sourceId,
      asOf: input.asOf,
      currency: input.currency,
      unit: input.unit,
      price24kPerGram: input.ratesByKarat["24K"] ?? 0,
      price23kPerGram: input.ratesByKarat["23K"] ?? null,
      price22kPerGram: input.ratesByKarat["22K"] ?? 0,
      price21kPerGram: input.ratesByKarat["21K"] ?? null,
      price18kPerGram: input.ratesByKarat["18K"] ?? null,
      price14kPerGram: input.ratesByKarat["14K"] ?? null,
      price12kPerGram: input.ratesByKarat["12K"] ?? null,
      price10kPerGram: input.ratesByKarat["10K"] ?? null,
      price9kPerGram: input.ratesByKarat["9K"] ?? null,
      price8kPerGram: input.ratesByKarat["8K"] ?? null,
      meta: input.meta ?? {}
    }
  });
}

export async function getSource(code: string) {
  return db.priceSource.findUniqueOrThrow({ where: { code } });
}

export async function getLastNormalized(code: string) {
  const source = await getSource(code);
  const latest = await db.priceNormalized.findFirst({
    where: { sourceId: source.id },
    orderBy: { asOf: "desc" }
  });

  return { source, latest };
}

export function shouldRun(lastAsOf: Date | null, everyMinutes: number) {
  if (!lastAsOf) {
    return true;
  }

  return Date.now() - lastAsOf.getTime() >= everyMinutes * 60 * 1000;
}

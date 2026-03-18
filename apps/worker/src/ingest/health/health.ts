import type { IngestStatus, Prisma } from "@prisma/client";

import { db } from "../../db/prisma.js";
import { emitAlert } from "../alerts/alerts.js";

export async function startRun() {
  return db.ingestRun.create({
    data: {
      status: "ok",
      summary: {}
    }
  });
}

export async function finishRun(runId: string, status: IngestStatus, summary: Prisma.InputJsonValue) {
  return db.ingestRun.update({
    where: { id: runId },
    data: {
      status,
      summary,
      runFinishedAt: new Date()
    }
  });
}

export async function recordSuccess(sourceId: string, asOf: Date) {
  await db.sourceHealth.update({
    where: { sourceId },
    data: {
      lastSuccessAt: new Date(),
      lastParsedAsOf: asOf,
      lastError: null,
      consecutiveFailures: 0
    }
  });
}

export async function recordFailure(
  sourceId: string,
  sourceCode: string,
  error: string,
  httpStatus: number | null,
  webhook: string | undefined
) {
  const current = await db.sourceHealth.findUniqueOrThrow({ where: { sourceId } });
  const nextFailures = current.consecutiveFailures + 1;

  await db.sourceHealth.update({
    where: { sourceId },
    data: {
      lastFailureAt: new Date(),
      consecutiveFailures: nextFailures,
      lastError: error,
      lastHttpStatus: httpStatus
    }
  });

  if (nextFailures >= 3) {
    await emitAlert(webhook, {
      severity: "error",
      sourceCode,
      message: "Parse or fetch failures reached threshold.",
      context: { error, consecutiveFailures: nextFailures, httpStatus },
      occurredAt: new Date().toISOString()
    });
  }
}

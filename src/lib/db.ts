import "server-only";

import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

declare global {
  var __trackYourGoldPrisma: PrismaClient | undefined;
}

export function getDb() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!global.__trackYourGoldPrisma) {
    global.__trackYourGoldPrisma = new PrismaClient();
  }

  return global.__trackYourGoldPrisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getDb()[prop as keyof PrismaClient];
  }
});

export async function checkDatabase() {
  if (!env.databaseUrl) {
    return { ok: false, status: "unconfigured" as const };
  }

  try {
    await getDb().$queryRawUnsafe("SELECT 1");
    return { ok: true, status: "connected" as const };
  } catch (error) {
    return {
      ok: false,
      status: "error" as const,
      message: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}


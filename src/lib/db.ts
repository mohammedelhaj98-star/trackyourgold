import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __trackYourGoldPrisma: PrismaClient | undefined;
}

function buildRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return undefined;
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol === "mysql:") {
      // Hostinger shared hosting is sensitive to bursty Prisma pools.
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("connect_timeout", "5");
      url.searchParams.set("pool_timeout", "5");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function getPrismaClient() {
  if (global.__trackYourGoldPrisma) {
    return global.__trackYourGoldPrisma;
  }

  const runtimeUrl = buildRuntimeDatabaseUrl();
  if (!runtimeUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: runtimeUrl
      }
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    global.__trackYourGoldPrisma = client;
  }

  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as unknown as object, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  }
});

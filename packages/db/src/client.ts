import { PrismaClient } from "@prisma/client";

declare global {
  var __trackYourGoldPrisma__: PrismaClient | undefined;
}

export function createPrismaClient() {
  return new PrismaClient();
}

export function getPrismaClient() {
  if (!global.__trackYourGoldPrisma__) {
    global.__trackYourGoldPrisma__ = createPrismaClient();
  }

  return global.__trackYourGoldPrisma__;
}

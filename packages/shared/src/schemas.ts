import { z } from "zod";

import { ITEM_CATEGORIES, SUPPORTED_KARATS, VALUATION_MODES } from "./constants.js";

const categoryValues = ITEM_CATEGORIES.map((value) => value) as [string, ...string[]];
const valuationModes = VALUATION_MODES.map((value) => value) as [string, ...string[]];

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  language: z.enum(["en", "ar"])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createVaultSchema = z.object({
  name: z.string().min(2).max(80)
});

export const createVaultItemSchema = z.object({
  itemName: z.string().min(1).max(120),
  category: z.enum(categoryValues),
  purityKarat: z.coerce.number().refine((value) => SUPPORTED_KARATS.includes(value as (typeof SUPPORTED_KARATS)[number]), {
    message: "Unsupported karat."
  }),
  grossWeightG: z.coerce.number().positive(),
  stoneWeightG: z.coerce.number().min(0).default(0),
  purchaseDate: z.string().date(),
  purchaseTotalPriceQar: z.coerce.number().positive(),
  makingChargesQar: z.coerce.number().min(0).default(0),
  vatQar: z.coerce.number().min(0).default(0),
  purchaseStoreName: z.string().max(120).optional().or(z.literal("")),
  purchaseLocation: z.string().max(120).optional().or(z.literal("")),
  purchaseNotes: z.string().max(2000).optional().or(z.literal(""))
});

export const updateVaultItemSchema = createVaultItemSchema.partial();

export const latestRatesQuerySchema = z.object({
  layer: z.enum(["market", "retail"]).default("market")
});

export const valuationQuerySchema = z.object({
  mode: z.enum(valuationModes).default("intrinsic"),
  sellSpreadPct: z.coerce.number().min(0).max(1).default(0.03)
});

export const valuationHistoryQuerySchema = z.object({
  mode: z.enum(valuationModes).default("intrinsic"),
  days: z.coerce.number().min(1).max(365).default(30)
});

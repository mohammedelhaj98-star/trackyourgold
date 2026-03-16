"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  return Number(getString(formData, key) || 0);
}

export async function createPurchaseAction(formData: FormData) {
  const user = await requireUser("/portfolio");
  const country = await db.country.findUnique({ where: { slug: getString(formData, "countrySlug") || "qatar" } });

  await db.purchase.create({
    data: {
      userId: user.id,
      countryId: country?.id ?? user.countryId!,
      storeName: getString(formData, "storeName"),
      karatLabel: getString(formData, "karatLabel") || "22K",
      grams: getNumber(formData, "grams"),
      pricePerGram: getNumber(formData, "pricePerGram"),
      totalPaid: getNumber(formData, "totalPaid"),
      makingCharge: getNumber(formData, "makingCharge"),
      notes: getString(formData, "notes") || null,
      purchasedAt: new Date(getString(formData, "purchasedAt") || new Date().toISOString())
    }
  });

  revalidatePath("/portfolio");
}

export async function createAlertRuleAction(formData: FormData) {
  const user = await requireUser("/alerts/settings");
  const country = await db.country.findUnique({ where: { slug: getString(formData, "countrySlug") || "qatar" } });

  await db.alertRule.create({
    data: {
      userId: user.id,
      countryId: country?.id ?? user.countryId!,
      karatLabel: getString(formData, "karatLabel") || null,
      type: getString(formData, "type") as "PRICE_DROP" | "NEW_90_DAY_LOW" | "WEEKLY_SUMMARY",
      percentThreshold: getNumber(formData, "percentThreshold") || null,
      comparisonDays: getNumber(formData, "comparisonDays") || null,
      emailEnabled: getString(formData, "emailEnabled") !== "off",
      dashboardEnabled: getString(formData, "dashboardEnabled") !== "off",
      summaryFrequency: getString(formData, "summaryFrequency") || null,
      cooldownMinutes: getNumber(formData, "cooldownMinutes") || 720,
      isActive: true,
      settingsJson: {
        source: "dashboard"
      }
    }
  });

  revalidatePath("/alerts/settings");
}

export async function saveAnalysisAction(formData: FormData) {
  const user = await requireUser("/saved");
  const country = await db.country.findUnique({ where: { slug: getString(formData, "countrySlug") || "qatar" } });
  const karatLabel = getString(formData, "karatLabel") || "22K";

  await db.savedAnalysis.upsert({
    where: {
      userId_countryId_karatLabel: {
        userId: user.id,
        countryId: country?.id ?? user.countryId!,
        karatLabel
      }
    },
    create: {
      userId: user.id,
      countryId: country?.id ?? user.countryId!,
      karatLabel,
      note: getString(formData, "note") || null
    },
    update: {
      note: getString(formData, "note") || null
    }
  });

  revalidatePath("/saved");
}

export async function toggleAdsSuppressionAction(formData: FormData) {
  const user = await requireUser("/dashboard");
  const nextValue = getString(formData, "adsSuppressed") === "true";
  await db.user.update({ where: { id: user.id }, data: { adsSuppressed: nextValue } });
  revalidatePath("/dashboard");
}

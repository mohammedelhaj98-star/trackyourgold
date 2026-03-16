"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSettingAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const key = value(formData, "key");
  const groupName = value(formData, "groupName") || "general";
  const rawValue = value(formData, "value");
  const valueType = value(formData, "valueType") || "string";
  const description = value(formData, "description") || null;

  await db.setting.upsert({
    where: { key },
    create: {
      key,
      groupName,
      value: rawValue,
      valueType,
      description,
      updatedById: admin.id
    },
    update: {
      groupName,
      value: rawValue,
      valueType,
      description,
      updatedById: admin.id
    }
  });

  await db.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "setting.updated",
      entityType: "setting",
      entityId: key,
      detailsJson: { groupName }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/premium");
  revalidatePath("/admin/scraper");
}

export async function updateAdSlotAction(formData: FormData) {
  const admin = await requireAdmin("/admin/ads");
  const id = value(formData, "id");
  const isEnabled = value(formData, "isEnabled") === "true";
  const placeholderMode = value(formData, "placeholderMode") === "true";

  await db.adSlot.update({
    where: { id },
    data: {
      name: value(formData, "name"),
      locationPath: value(formData, "locationPath") || null,
      isEnabled,
      placeholderMode,
      provider: value(formData, "provider") || null,
      adsenseClient: value(formData, "adsenseClient") || null,
      adsenseSlot: value(formData, "adsenseSlot") || null,
      customCode: value(formData, "customCode") || null,
      placeholderTitle: value(formData, "placeholderTitle") || null,
      placeholderDescription: value(formData, "placeholderDescription") || null,
      adminNotes: value(formData, "adminNotes") || null
    }
  });

  await db.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "ad_slot.updated",
      entityType: "ad_slot",
      entityId: id,
      detailsJson: { isEnabled, placeholderMode }
    }
  });

  revalidatePath("/admin/ads");
}

export async function createArticleAction(formData: FormData) {
  const admin = await requireAdmin("/admin/articles");
  const slug = value(formData, "slug");
  const status = value(formData, "status") || "DRAFT";
  const publishedAt = value(formData, "publishedAt");

  await db.blogArticle.create({
    data: {
      authorId: admin.id,
      slug,
      title: value(formData, "title"),
      excerpt: value(formData, "excerpt"),
      body: value(formData, "body"),
      category: value(formData, "category") || null,
      status: status as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      publishedAt: publishedAt ? new Date(publishedAt) : status === "PUBLISHED" ? new Date() : null,
      scheduledAt: status === "SCHEDULED" && publishedAt ? new Date(publishedAt) : null,
      tagsJson: value(formData, "tags") ? value(formData, "tags").split(",").map((item) => item.trim()) : []
    }
  });

  revalidatePath("/admin/articles");
  revalidatePath("/gold-insights");
}

export async function createContentPageAction(formData: FormData) {
  const admin = await requireAdmin("/admin/seo");
  await db.contentPage.create({
    data: {
      type: value(formData, "type") as "LANDING" | "GUIDE" | "FAQ" | "CALCULATOR" | "MARKET_ANALYSIS" | "COUNTRY" | "CITY" | "STORE_COMPARISON" | "KARAT",
      slug: value(formData, "slug"),
      title: value(formData, "title"),
      summary: value(formData, "summary") || null,
      intro: value(formData, "intro") || null,
      body: value(formData, "body"),
      status: (value(formData, "status") || "DRAFT") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      publishAt: value(formData, "publishAt") ? new Date(value(formData, "publishAt")) : null,
      localeKey: value(formData, "localeKey") || null,
      heroMetricLabel: value(formData, "heroMetricLabel") || null
    }
  });

  revalidatePath("/admin/seo");
}

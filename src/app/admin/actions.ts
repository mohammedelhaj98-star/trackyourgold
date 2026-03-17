"use server";

import { ContentPageType, ContentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  authenticateUser,
  createSession,
  destroySession,
  requireAdmin
} from "@/lib/auth/session";
import { type NavigationLink, type RedirectRule } from "@/lib/cms";
import { db } from "@/lib/db";
import { hasDatabaseConfig, hasSessionConfig } from "@/lib/env";

function sanitizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: FormDataEntryValue | null) {
  const sanitized = sanitizeText(value);
  return sanitized.length > 0 ? sanitized : null;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function parsePublishDate(status: ContentStatus, existing?: Date | null) {
  if (status === ContentStatus.PUBLISHED) {
    return existing ?? new Date();
  }

  return null;
}

function safeRedirectTarget(target: string) {
  return target.startsWith("/") ? target : "/admin";
}

function parseNavigationDraft(rawValue: string): NavigationLink[] {
  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());

      if (!label || !href) {
        throw new Error("Navigation lines must use Label|/path format.");
      }

      return { label, href };
    });
}

function parseRedirectDraft(rawValue: string): RedirectRule[] {
  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [fromPath, toPath, codeValue] = line.split("|").map((part) => part.trim());

      if (!fromPath || !toPath) {
        throw new Error("Redirect lines must use /from|/to|301 format.");
      }

      const statusCode = codeValue === "302" ? 302 : 301;
      return { fromPath, toPath, statusCode };
    });
}

async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  detailsJson?: object
) {
  try {
    await db.adminAuditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        detailsJson
      }
    });
  } catch {
    // Audit logging should not block admin operations in the reset baseline.
  }
}

async function upsertSetting({
  key,
  groupName,
  value,
  valueType,
  description,
  updatedById
}: {
  key: string;
  groupName: string;
  value: string;
  valueType: string;
  description?: string | null;
  updatedById?: string;
}) {
  return db.setting.upsert({
    where: { key },
    update: {
      groupName,
      value,
      valueType,
      description,
      updatedById
    },
    create: {
      key,
      groupName,
      value,
      valueType,
      description,
      updatedById
    }
  });
}

async function upsertContentSeo(contentPageId: string, title: string | null, description: string | null) {
  if (!title || !description) {
    return;
  }

  await db.seoMetadata.upsert({
    where: { contentPageId },
    update: {
      title,
      description
    },
    create: {
      contentPageId,
      title,
      description
    }
  });
}

async function upsertArticleSeo(blogArticleId: string, title: string | null, description: string | null) {
  if (!title || !description) {
    return;
  }

  await db.seoMetadata.upsert({
    where: { blogArticleId },
    update: {
      title,
      description
    },
    create: {
      blogArticleId,
      title,
      description
    }
  });
}

async function upsertFaqSeo(faqId: string, title: string | null, description: string | null) {
  if (!title || !description) {
    return;
  }

  await db.seoMetadata.upsert({
    where: { faqId },
    update: {
      title,
      description
    },
    create: {
      faqId,
      title,
      description
    }
  });
}

function revalidateCmsSurface(...tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

export async function loginAction(formData: FormData) {
  if (!hasDatabaseConfig() || !hasSessionConfig()) {
    redirect("/login?error=Database%20and%20session%20configuration%20are%20required.");
  }

  const email = sanitizeText(formData.get("email")).toLowerCase();
  const password = sanitizeText(formData.get("password"));
  const nextPath = safeRedirectTarget(sanitizeText(formData.get("next")) || "/admin");

  const user = await authenticateUser(email, password);
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Invalid credentials.")}&next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role !== "ADMIN") {
    redirect(`/login?error=${encodeURIComponent("Admin access only.")}&next=${encodeURIComponent(nextPath)}`);
  }

  await createSession(user.id);
  redirect(nextPath);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login?message=Signed%20out.");
}

export async function saveHomepageAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const status = (sanitizeText(formData.get("status")) || "PUBLISHED") as ContentStatus;
  const existing = await db.contentPage.findUnique({ where: { slug: "home" } });

  const page = await db.contentPage.upsert({
    where: { slug: "home" },
    update: {
      type: ContentPageType.LANDING,
      title: sanitizeText(formData.get("title")) || "TrackYourGold reset homepage",
      summary: optionalText(formData.get("summary")),
      intro: optionalText(formData.get("intro")),
      body: sanitizeText(formData.get("body")) || "Homepage copy is empty.",
      status,
      publishAt: parsePublishDate(status, existing?.publishAt),
      heroMetricLabel: optionalText(formData.get("heroMetricLabel"))
    },
    create: {
      slug: "home",
      type: ContentPageType.LANDING,
      title: sanitizeText(formData.get("title")) || "TrackYourGold reset homepage",
      summary: optionalText(formData.get("summary")),
      intro: optionalText(formData.get("intro")),
      body: sanitizeText(formData.get("body")) || "Homepage copy is empty.",
      status,
      publishAt: parsePublishDate(status),
      heroMetricLabel: optionalText(formData.get("heroMetricLabel"))
    }
  });

  await Promise.all([
    upsertSetting({
      key: "site.homepage.layout",
      groupName: "site",
      value: JSON.stringify({
        eyebrow: sanitizeText(formData.get("eyebrow")) || "TrackYourGold Reset",
        primaryCtaLabel: sanitizeText(formData.get("primaryCtaLabel")) || "Open admin",
        primaryCtaHref: sanitizeText(formData.get("primaryCtaHref")) || "/login",
        secondaryCtaLabel: sanitizeText(formData.get("secondaryCtaLabel")) || "Check health",
        secondaryCtaHref: sanitizeText(formData.get("secondaryCtaHref")) || "/health"
      }),
      valueType: "json",
      description: "Homepage hero navigation controls",
      updatedById: admin.id
    }),
    upsertContentSeo(page.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")))
  ]);

  await logAdminAction(admin.id, "save-homepage", "ContentPage", page.id, { slug: "home" });
  revalidateCmsSurface("settings", "homepage", "content-pages");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?message=Homepage%20saved.#homepage");
}

export async function saveNavigationAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const links = parseNavigationDraft(sanitizeText(formData.get("navigation")));

  await upsertSetting({
    key: "site.navigation",
    groupName: "site",
    value: JSON.stringify(links),
    valueType: "json",
    description: "Primary navigation for the reset baseline",
    updatedById: admin.id
  });

  await logAdminAction(admin.id, "save-navigation", "Setting", "site.navigation", { count: links.length });
  revalidateCmsSurface("settings");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?message=Navigation%20saved.#navigation");
}

export async function saveRedirectRulesAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const rules = parseRedirectDraft(sanitizeText(formData.get("redirects")));

  await upsertSetting({
    key: "site.redirects",
    groupName: "site",
    value: JSON.stringify(rules),
    valueType: "json",
    description: "Redirect rules for the reset baseline",
    updatedById: admin.id
  });

  await logAdminAction(admin.id, "save-redirects", "Setting", "site.redirects", { count: rules.length });
  revalidateCmsSurface("settings");
  revalidatePath("/admin");
  redirect("/admin?message=Redirect%20rules%20saved.#redirects");
}

export async function createContentPageAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const slug = normalizeSlug(sanitizeText(formData.get("slug")));
  const status = (sanitizeText(formData.get("status")) || "DRAFT") as ContentStatus;

  const page = await db.contentPage.create({
    data: {
      slug,
      type: (sanitizeText(formData.get("type")) || "LANDING") as ContentPageType,
      title: sanitizeText(formData.get("title")) || slug,
      summary: optionalText(formData.get("summary")),
      intro: optionalText(formData.get("intro")),
      body: sanitizeText(formData.get("body")) || "Page body is empty.",
      status,
      publishAt: parsePublishDate(status),
      countryId: optionalText(formData.get("countryId")),
      cityId: optionalText(formData.get("cityId")),
      storeId: optionalText(formData.get("storeId"))
    }
  });

  await upsertContentSeo(page.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));
  await logAdminAction(admin.id, "create-page", "ContentPage", page.id, { slug });
  revalidateCmsSurface("content-pages");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?message=Page%20created.#pages");
}

export async function updateContentPageAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const pageId = sanitizeText(formData.get("pageId"));
  const oldSlug = sanitizeText(formData.get("oldSlug"));
  const newSlug = normalizeSlug(sanitizeText(formData.get("slug")));
  const status = (sanitizeText(formData.get("status")) || "DRAFT") as ContentStatus;

  const page = await db.contentPage.update({
    where: { id: pageId },
    data: {
      slug: newSlug,
      type: (sanitizeText(formData.get("type")) || "LANDING") as ContentPageType,
      title: sanitizeText(formData.get("title")) || newSlug,
      summary: optionalText(formData.get("summary")),
      intro: optionalText(formData.get("intro")),
      body: sanitizeText(formData.get("body")) || "Page body is empty.",
      status,
      publishAt: parsePublishDate(status, new Date()),
      countryId: optionalText(formData.get("countryId")),
      cityId: optionalText(formData.get("cityId")),
      storeId: optionalText(formData.get("storeId"))
    }
  });

  await upsertContentSeo(page.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));

  if (oldSlug && oldSlug !== newSlug && parseBoolean(formData.get("createRedirect"))) {
    const setting = await db.setting.findUnique({ where: { key: "site.redirects" } });
    const existingRules = setting?.value ? (JSON.parse(setting.value) as RedirectRule[]) : [];
    const nextRules = [
      ...existingRules.filter((rule) => rule.fromPath !== `/${oldSlug}`),
      { fromPath: `/${oldSlug}`, toPath: `/${newSlug}`, statusCode: 301 as const }
    ];

    await upsertSetting({
      key: "site.redirects",
      groupName: "site",
      value: JSON.stringify(nextRules),
      valueType: "json",
      description: "Redirect rules for the reset baseline",
      updatedById: admin.id
    });
  }

  await logAdminAction(admin.id, "update-page", "ContentPage", page.id, { slug: newSlug });
  revalidateCmsSurface("content-pages", "settings");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?message=Page%20updated.#pages");
}

export async function deleteContentPageAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const pageId = sanitizeText(formData.get("pageId"));

  await db.contentPage.delete({ where: { id: pageId } });
  await logAdminAction(admin.id, "delete-page", "ContentPage", pageId);
  revalidateCmsSurface("content-pages");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?message=Page%20deleted.#pages");
}

export async function createArticleAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const slug = normalizeSlug(sanitizeText(formData.get("slug")));
  const status = (sanitizeText(formData.get("status")) || "DRAFT") as ContentStatus;

  const article = await db.blogArticle.create({
    data: {
      authorId: admin.id,
      countryId: optionalText(formData.get("countryId")),
      slug,
      title: sanitizeText(formData.get("title")) || slug,
      excerpt: sanitizeText(formData.get("excerpt")) || "Article excerpt is empty.",
      body: sanitizeText(formData.get("body")) || "Article body is empty.",
      category: optionalText(formData.get("category")),
      status,
      publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null
    }
  });

  await upsertArticleSeo(article.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));
  await logAdminAction(admin.id, "create-article", "BlogArticle", article.id, { slug });
  revalidateCmsSurface("blog-articles");
  revalidatePath("/admin");
  redirect("/admin?message=Article%20created.#articles");
}

export async function updateArticleAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const articleId = sanitizeText(formData.get("articleId"));
  const slug = normalizeSlug(sanitizeText(formData.get("slug")));
  const status = (sanitizeText(formData.get("status")) || "DRAFT") as ContentStatus;

  const article = await db.blogArticle.update({
    where: { id: articleId },
    data: {
      countryId: optionalText(formData.get("countryId")),
      slug,
      title: sanitizeText(formData.get("title")) || slug,
      excerpt: sanitizeText(formData.get("excerpt")) || "Article excerpt is empty.",
      body: sanitizeText(formData.get("body")) || "Article body is empty.",
      category: optionalText(formData.get("category")),
      status,
      publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null
    }
  });

  await upsertArticleSeo(article.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));
  await logAdminAction(admin.id, "update-article", "BlogArticle", article.id, { slug });
  revalidateCmsSurface("blog-articles");
  revalidatePath("/admin");
  redirect("/admin?message=Article%20updated.#articles");
}

export async function deleteArticleAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const articleId = sanitizeText(formData.get("articleId"));

  await db.blogArticle.delete({ where: { id: articleId } });
  await logAdminAction(admin.id, "delete-article", "BlogArticle", articleId);
  revalidateCmsSurface("blog-articles");
  revalidatePath("/admin");
  redirect("/admin?message=Article%20deleted.#articles");
}

export async function createFaqAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const slug = normalizeSlug(sanitizeText(formData.get("slug")));

  const faq = await db.faq.create({
    data: {
      countryId: optionalText(formData.get("countryId")),
      slug,
      question: sanitizeText(formData.get("question")) || slug,
      answer: sanitizeText(formData.get("answer")) || "FAQ answer is empty.",
      category: optionalText(formData.get("category")),
      sortOrder: Number.parseInt(sanitizeText(formData.get("sortOrder")) || "0", 10),
      isPublished: parseBoolean(formData.get("isPublished"))
    }
  });

  await upsertFaqSeo(faq.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));
  await logAdminAction(admin.id, "create-faq", "Faq", faq.id, { slug });
  revalidateCmsSurface("faqs");
  revalidatePath("/admin");
  redirect("/admin?message=FAQ%20created.#faqs");
}

export async function updateFaqAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const faqId = sanitizeText(formData.get("faqId"));
  const slug = normalizeSlug(sanitizeText(formData.get("slug")));

  const faq = await db.faq.update({
    where: { id: faqId },
    data: {
      countryId: optionalText(formData.get("countryId")),
      slug,
      question: sanitizeText(formData.get("question")) || slug,
      answer: sanitizeText(formData.get("answer")) || "FAQ answer is empty.",
      category: optionalText(formData.get("category")),
      sortOrder: Number.parseInt(sanitizeText(formData.get("sortOrder")) || "0", 10),
      isPublished: parseBoolean(formData.get("isPublished"))
    }
  });

  await upsertFaqSeo(faq.id, optionalText(formData.get("seoTitle")), optionalText(formData.get("seoDescription")));
  await logAdminAction(admin.id, "update-faq", "Faq", faq.id, { slug });
  revalidateCmsSurface("faqs");
  revalidatePath("/admin");
  redirect("/admin?message=FAQ%20updated.#faqs");
}

export async function deleteFaqAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const faqId = sanitizeText(formData.get("faqId"));

  await db.faq.delete({ where: { id: faqId } });
  await logAdminAction(admin.id, "delete-faq", "Faq", faqId);
  revalidateCmsSurface("faqs");
  revalidatePath("/admin");
  redirect("/admin?message=FAQ%20deleted.#faqs");
}

export async function createCountryAction(formData: FormData) {
  const admin = await requireAdmin("/admin");

  const country = await db.country.create({
    data: {
      code: sanitizeText(formData.get("code")).toUpperCase(),
      slug: normalizeSlug(sanitizeText(formData.get("slug"))),
      name: sanitizeText(formData.get("name")),
      currencyCode: sanitizeText(formData.get("currencyCode")).toUpperCase() || "QAR",
      timezone: sanitizeText(formData.get("timezone")) || "Asia/Qatar",
      isActive: parseBoolean(formData.get("isActive"))
    }
  });

  await logAdminAction(admin.id, "create-country", "Country", country.id, { slug: country.slug });
  revalidateCmsSurface("taxonomy");
  revalidatePath("/admin");
  redirect("/admin?message=Country%20created.#taxonomy");
}

export async function createCityAction(formData: FormData) {
  const admin = await requireAdmin("/admin");

  const city = await db.city.create({
    data: {
      countryId: sanitizeText(formData.get("countryId")),
      slug: normalizeSlug(sanitizeText(formData.get("slug"))),
      name: sanitizeText(formData.get("name")),
      isActive: parseBoolean(formData.get("isActive"))
    }
  });

  await logAdminAction(admin.id, "create-city", "City", city.id, { slug: city.slug });
  revalidateCmsSurface("taxonomy");
  revalidatePath("/admin");
  redirect("/admin?message=City%20created.#taxonomy");
}

export async function createStoreAction(formData: FormData) {
  const admin = await requireAdmin("/admin");

  const store = await db.store.create({
    data: {
      countryId: sanitizeText(formData.get("countryId")),
      cityId: optionalText(formData.get("cityId")),
      slug: normalizeSlug(sanitizeText(formData.get("slug"))),
      name: sanitizeText(formData.get("name")),
      brand: optionalText(formData.get("brand")),
      externalUrl: optionalText(formData.get("externalUrl")),
      description: optionalText(formData.get("description")),
      isPrimarySource: parseBoolean(formData.get("isPrimarySource"))
    }
  });

  await logAdminAction(admin.id, "create-store", "Store", store.id, { slug: store.slug });
  revalidateCmsSurface("taxonomy");
  revalidatePath("/admin");
  redirect("/admin?message=Store%20created.#taxonomy");
}

export async function saveSettingAction(formData: FormData) {
  const admin = await requireAdmin("/admin");
  const key = sanitizeText(formData.get("key"));

  await upsertSetting({
    key,
    groupName: sanitizeText(formData.get("groupName")) || "site",
    value: sanitizeText(formData.get("value")),
    valueType: sanitizeText(formData.get("valueType")) || "string",
    description: optionalText(formData.get("description")),
    updatedById: admin.id
  });

  await logAdminAction(admin.id, "save-setting", "Setting", key);
  revalidateCmsSurface("settings");
  revalidatePath("/admin");
  redirect("/admin?message=Setting%20saved.#settings");
}

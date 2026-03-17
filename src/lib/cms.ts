import "server-only";

import { ContentStatus, type ContentPage, type SeoMetadata } from "@prisma/client";

import { db } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export type NavigationLink = {
  label: string;
  href: string;
};

export type RedirectRule = {
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
};

export type HomepageLayout = {
  eyebrow: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

type HomepageRecord = ContentPage & {
  seoMetadata: SeoMetadata | null;
};

const defaultHomepageLayout: HomepageLayout = {
  eyebrow: "TrackYourGold Reset",
  primaryCtaLabel: "Open admin",
  primaryCtaHref: "/login",
  secondaryCtaLabel: "Check health",
  secondaryCtaHref: "/health"
};

const defaultNavigation: NavigationLink[] = [
  { label: "Homepage", href: "/" },
  { label: "Health", href: "/health" },
  { label: "Login", href: "/login" }
];

const defaultRedirectRules: RedirectRule[] = [];

function parseJson<T>(value: string | null | undefined, fallback: T) {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function getSettingValue(key: string) {
  if (!hasDatabaseConfig()) return null;

  try {
    const setting = await db.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

export async function getNavigationLinks() {
  return parseJson(await getSettingValue("site.navigation"), defaultNavigation);
}

export async function getRedirectRules() {
  return parseJson(await getSettingValue("site.redirects"), defaultRedirectRules);
}

export async function getHomepageLayout() {
  return parseJson(await getSettingValue("site.homepage.layout"), defaultHomepageLayout);
}

export async function getHomepageRecord(): Promise<HomepageRecord | null> {
  if (!hasDatabaseConfig()) return null;

  try {
    return await db.contentPage.findUnique({
      where: { slug: "home" },
      include: { seoMetadata: true }
    });
  } catch {
    return null;
  }
}

export async function getHomepageData() {
  const [layout, page] = await Promise.all([getHomepageLayout(), getHomepageRecord()]);

  return {
    layout,
    page: page ?? {
      id: "home-fallback",
      countryId: null,
      cityId: null,
      storeId: null,
      type: "LANDING",
      slug: "home",
      localeKey: null,
      title: "TrackYourGold is starting over on a cleaner foundation.",
      summary: "This reset keeps the database, proves the runtime first, and rebuilds the public site and admin CMS in a much smaller, more stable shape.",
      intro: "The homepage is now the primary product surface. Admin can manage homepage copy, SEO pages, taxonomy, navigation, and core settings from one simpler console.",
      body: "Use this reset to prove deployment stability on Hostinger before rebuilding pricing, dashboards, and deeper SEO templates.\n\nThe old app has been archived in Git history. This active branch is now optimized for stability, CMS ownership, and controlled feature reintroduction.",
      status: "PUBLISHED",
      publishAt: null,
      heroMetricLabel: "Reset baseline",
      faqJson: null,
      relatedLinksJson: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      seoMetadata: null
    }
  };
}

export async function getPublishedContentPages(limit = 8) {
  if (!hasDatabaseConfig()) return [];

  try {
    return await db.contentPage.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        slug: { not: "home" }
      },
      orderBy: [{ publishAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      include: { seoMetadata: true }
    });
  } catch {
    return [];
  }
}

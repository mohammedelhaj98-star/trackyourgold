import "server-only";

import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getAdminDashboardData() {
  const [users, settings, parserFailures, logs, adSlots, articles, analytics, alertRules] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    db.setting.findMany({ orderBy: [{ groupName: "asc" }, { key: "asc" }] }),
    db.parserFailure.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { store: true } }),
    db.systemLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    db.adSlot.findMany({ orderBy: { name: "asc" } }),
    db.blogArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 12 }),
    db.internalAnalytics.groupBy({ by: ["path"], _count: { path: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
    db.alertRule.findMany({ orderBy: { updatedAt: "desc" }, take: 10, include: { user: true, country: true } })
  ]);

  const publishedPages = await db.contentPage.count({ where: { status: ContentStatus.PUBLISHED } });

  return {
    users,
    settings,
    parserFailures,
    logs,
    adSlots,
    articles,
    analytics,
    alertRules,
    publishedPages
  };
}

export async function getAdminAnalyticsData() {
  const [pageViews, signups, affiliateClicks, topCountries, registrations] = await Promise.all([
    db.internalAnalytics.groupBy({ by: ["path"], where: { eventType: "page_view" }, _count: { path: true }, orderBy: { _count: { path: "desc" } }, take: 20 }),
    db.internalAnalytics.groupBy({ by: ["sourcePage"], where: { eventType: "lead_signup" }, _count: { sourcePage: true }, orderBy: { _count: { sourcePage: "desc" } }, take: 10 }),
    db.affiliateClick.groupBy({ by: ["pagePath"], _count: { pagePath: true }, orderBy: { _count: { pagePath: "desc" } }, take: 10 }),
    db.internalAnalytics.groupBy({ by: ["countryId"], _count: { countryId: true }, orderBy: { _count: { countryId: "desc" } }, take: 10 }),
    db.internalAnalytics.groupBy({ by: ["sourcePage"], where: { eventType: "registration" }, _count: { sourcePage: true }, orderBy: { _count: { sourcePage: "desc" } }, take: 10 })
  ]);

  return { pageViews, signups, affiliateClicks, topCountries, registrations };
}

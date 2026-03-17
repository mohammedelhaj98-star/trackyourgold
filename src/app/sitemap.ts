import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/alerts",
    "/gold-insights",
    "/faq",
    "/calculators/qar-gold-calculator",
    "/calculators/gold-premium-calculator",
    "/calculators/should-i-buy-gold-now",
    "/calculators/gold-profit-loss-calculator",
    "/calculators/making-charge-calculator",
    "/calculators/gold-savings-goal-calculator"
  ];

  try {
    const { db } = await import("@/lib/db");
    const [countries, cities, stores, articles] = await Promise.all([
      db.country.findMany({ where: { isActive: true } }),
      db.city.findMany({ where: { isActive: true }, include: { country: true } }),
      db.store.findMany({ include: { city: true, country: true } }),
      db.blogArticle.findMany({ where: { status: "PUBLISHED" } })
    ]);

    const dynamicRoutes = [
      ...countries.flatMap((country) => [
        `/countries/${country.slug}`,
        `/live/${country.slug}/22K`,
        `/live/${country.slug}/24K`,
        `/history/${country.slug}/22K`,
        `/best-time-to-buy/${country.slug}`,
        `/guides/${country.slug}/buying`,
        `/analysis/${country.slug}`,
        `/karats/${country.slug}/22K`,
        `/karats/${country.slug}/24K`
      ]),
      ...cities.map((city) => `/countries/${city.country.slug}/cities/${city.slug}`),
      ...cities.map((city) => `/compare/${city.country.slug}/${city.slug}`),
      ...stores.map((store) => `/stores/${store.country.slug}/${store.city?.slug ?? "doha"}/${store.slug}`),
      ...articles.map((article) => `/gold-insights/${article.slug}`)
    ];

    return [...staticRoutes, ...dynamicRoutes].map((path) => ({ url: absoluteUrl(path), lastModified: new Date() }));
  } catch {
    return staticRoutes.map((path) => ({ url: absoluteUrl(path), lastModified: new Date() }));
  }
}

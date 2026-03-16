import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { buildMetadata } from "@/lib/seo";
import { getCityHubData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country, city } = await params;
  return buildMetadata({
    title: `Gold store comparison in ${city}, ${country}`,
    description: `Store comparison architecture page for ${city}, ${country}, ready for future affiliate comparison tables and local expansion.`,
    path: `/compare/${country}/${city}`
  });
}

export default async function ComparePage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const data = await getCityHubData(country, city);
  if (!data) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="store_compare_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Store comparison page</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Gold store comparison in {data.city.name}, {data.country.name}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">Version 1 launches with the database, routing, and affiliate-ready fields for store comparison. As more stores are added, this page can grow into comparison tables, recommendation cards, and geo-targeted outbound links without a route refactor.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {data.city.stores.map((store) => (
          <div key={store.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-200">Store</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">{store.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">Affiliate links, ratings, metadata, and local comparison modules are supported by the schema even if content starts light.</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Next best pages</h2>
        <InternalLinksGrid
          items={[
            { href: `/countries/${country}`, title: `${data.country.name} country hub`, description: "Country-level gold page with city and store links." },
            { href: `/countries/${country}/cities/${city}`, title: `${data.city.name} city hub`, description: "City landing page that can scale with more store content." },
            { href: "/alerts", title: "Get alerts", description: "Capture visitors before they leave comparison pages." },
            { href: "/gold-insights", title: "Gold Insights", description: "Trust-building content hub for explainers and buying guides." },
            { href: `/guides/${country}/buying`, title: "Buying guide", description: "Long-form guide that supports the comparison funnel." },
            { href: `/stores/${country}/${city}/${data.city.stores[0]?.slug ?? "malabar-gold-diamonds-qatar"}`, title: "Primary store page", description: "Dive deeper into the tracked store source." }
          ]}
        />
      </section>
    </div>
  );
}
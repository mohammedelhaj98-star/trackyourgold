import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { DataUnavailableState } from "@/components/ui/data-unavailable-state";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { buildMetadata } from "@/lib/seo";
import { formatQar } from "@/lib/utils";
import { getCountryHubData } from "@/server/data/market";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  return buildMetadata({
    title: `Gold price in ${country} today`,
    description: `Country-level gold hub for ${country}, linking live prices, history pages, city pages, store pages, and buying guides.`,
    path: `/countries/${country}`
  });
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const data = await getCountryHubData(country);
  if (!data || !data.overview) {
    return (
      <DataUnavailableState
        eyebrow="Country hub unavailable"
        title={`The ${country} country hub is temporarily unavailable.`}
        description="This page depends on live country, city, and store data from the production database. The route will recover automatically once the database connection is restored."
        primaryHref="/"
        primaryLabel="Return home"
        secondaryHref="/login"
        secondaryLabel="Open login"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="country_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Country hub</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Gold price in {data.country.name} today</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">Country pages are the backbone of geographic expansion. They aggregate live pricing, city routes, stores, and internal links to karat pages, calculators, guides, and analysis pages.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.overview.cards.map((card) => (
          <MetricCard key={card.karatLabel} label={card.karatLabel} value={formatQar(card.pricePerGram)} detail={`Updated ${card.updatedAt.toISOString().slice(0, 16).replace("T", " ")}`} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Cities</h2>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            {data.country.cities.map((city) => (
              <a key={city.id} href={`/countries/${country}/cities/${city.slug}`} className="block rounded-2xl border border-white/10 px-4 py-3 transition hover:bg-white/5 hover:text-white">
                {city.name}
              </a>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Stores</h2>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            {data.country.stores.map((store) => (
              <a key={store.id} href={`/stores/${country}/${store.cityId ? data.country.cities.find((city) => city.id === store.cityId)?.slug : "doha"}/${store.slug}`} className="block rounded-2xl border border-white/10 px-4 py-3 transition hover:bg-white/5 hover:text-white">
                {store.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Country-level internal linking</h2>
        <InternalLinksGrid
          items={[
            { href: `/live/${country}/22K`, title: "22K live price", description: "Launch price page optimized for daily search demand." },
            { href: `/history/${country}/22K`, title: "22K history", description: "Historical trend page for recurring search demand." },
            { href: `/best-time-to-buy/${country}`, title: "Best time to buy", description: "Timing page with high-intent commercial relevance." },
            { href: `/analysis/${country}`, title: "Market analysis", description: "Country analysis hub linking all core content types." },
            { href: `/guides/${country}/buying`, title: "Buying guide", description: "Long-form guide supporting trust and conversions." },
            { href: `/compare/${country}/doha`, title: "Store comparisons", description: "Architecture-ready comparison page for future affiliate monetization." }
          ]}
        />
      </section>
    </div>
  );
}

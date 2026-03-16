import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { buildMetadata } from "@/lib/seo";
import { getCityHubData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country, city } = await params;
  return buildMetadata({
    title: `Gold price in ${city}, ${country}`,
    description: `City-level gold hub for ${city}, ${country}, connecting store pages, comparisons, and country-level market pages.`,
    path: `/countries/${country}/cities/${city}`
  });
}

export default async function CityPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const data = await getCityHubData(country, city);
  if (!data) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="city_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">City hub</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Gold price in {data.city.name}, {data.country.name}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">City pages support future location-specific internal links and affiliate blocks while also giving search engines a clean city-country-store hierarchy.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.city.stores.map((store) => (
          <a key={store.id} href={`/stores/${country}/${city}/${store.slug}`} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel transition hover:border-gold-300/30">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-200">Store page</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">{store.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">Open store details, affiliate-ready fields, and tracked price context.</p>
          </a>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related city links</h2>
        <InternalLinksGrid
          items={[
            { href: `/compare/${country}/${city}`, title: "Store comparison", description: "Future-ready comparison route for this city." },
            { href: `/countries/${country}`, title: `${data.country.name} country hub`, description: "Country hub for broader internal linking." },
            { href: `/live/${country}/22K`, title: "22K live price", description: "Current local price page for the launch karat." },
            { href: `/alerts`, title: "Price alerts", description: "Lead magnet flow for visitors researching this city." }
          ]}
        />
      </section>
    </div>
  );
}
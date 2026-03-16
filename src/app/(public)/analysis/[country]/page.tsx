import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { buildMetadata } from "@/lib/seo";
import { formatQar } from "@/lib/utils";
import { getMarketOverview } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  return buildMetadata({
    title: `${country} gold market analysis`,
    description: `Country-level market analysis for ${country}, combining local store rates, premium-versus-spot context, and buying guides.`,
    path: `/analysis/${country}`
  });
}

export default async function AnalysisPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const overview = await getMarketOverview(country);
  if (!overview) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="analysis_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Country analysis</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{overview.country.name} gold market analysis</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">This hub ties together live store rates, recommendation labels, best-time pages, and educational content so TrackYourGold can scale country-level internal linking from the first release.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {overview.cards.map((card) => (
          <MetricCard key={card.karatLabel} label={card.karatLabel} value={formatQar(card.pricePerGram)} detail={`Latest recommendation: ${card.recommendation?.label.replaceAll("_", " ") ?? "WAIT"}`} />
        ))}
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <div className="space-y-5 text-sm leading-8 text-white/72">
          <p>For launch, Qatar is the primary market and Malabar Gold & Diamonds is the primary tracked store source. The data model already supports future expansion to more countries, cities, stores, and localized affiliate recommendations.</p>
          <p>Public analysis pages should grow into category hubs: country, city, karat, store comparison, and guide pages all reinforce each other through internal links and consistent schema markup.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Explore this market</h2>
        <InternalLinksGrid
          items={[
            { href: `/countries/${country}`, title: `${overview.country.name} country hub`, description: "Country landing page linking cities, stores, and core SEO pages." },
            { href: `/best-time-to-buy/${country}`, title: "Best time to buy", description: "High-intent timing page powered by local data." },
            { href: `/compare/${country}/doha`, title: "Store comparison page", description: "Architecture-ready template for comparing stores and affiliate blocks." },
            { href: `/guides/${country}/buying`, title: "Buying guide", description: "Long-form guide for conversion and search traffic." },
            { href: `/alerts`, title: "Price drop alerts", description: "Lead magnet page for free alerts." },
            { href: "/gold-insights", title: "Gold Insights", description: "Articles and explainers that support trust and return visits." }
          ]}
        />
      </section>
    </div>
  );
}
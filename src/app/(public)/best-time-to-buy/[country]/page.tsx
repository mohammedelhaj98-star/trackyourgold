import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { RecommendationBadge } from "@/components/ui/recommendation-badge";
import { buildMetadata } from "@/lib/seo";
import { formatPercent } from "@/lib/utils";
import { getPricePageData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  return buildMetadata({
    title: `Best time to buy gold in ${country}`,
    description: `Data-driven timing page for gold buyers in ${country}, based on tracked local rates and spot-derived premium analysis.`,
    path: `/best-time-to-buy/${country}`
  });
}

export default async function BestTimeToBuyPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const data = await getPricePageData(country, "22K");
  if (!data) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="best_time_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Market timing page</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Best time to buy gold in {data.country.name}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">This page interprets recent local rate behavior, premium versus spot, and buy-signal thresholds so visitors can decide whether today looks attractive or whether patience is more sensible.</p>
        <RecommendationBadge label={data.recommendation?.label ?? "WAIT"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Current score</p>
          <p className="mt-3 font-display text-5xl font-semibold text-white">{data.recommendation?.score ?? "n/a"}</p>
          <p className="mt-3 text-sm text-white/65">Weighted score from trend, momentum, and premium signals.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">7-day trend</p>
          <p className="mt-3 font-display text-5xl font-semibold text-white">{formatPercent(data.stats.change7d)}</p>
          <p className="mt-3 text-sm text-white/65">A softer trend often improves entry quality if premium also remains contained.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Premium vs spot</p>
          <p className="mt-3 font-display text-5xl font-semibold text-white">{data.stats.premiumVsSpot !== null ? formatPercent(data.stats.premiumVsSpot) : "n/a"}</p>
          <p className="mt-3 text-sm text-white/65">A narrower premium generally supports better timing.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">How TrackYourGold scores timing</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
            <li>• Price below 30-day average</li>
            <li>• Price below 90-day average</li>
            <li>• Significant 24-hour drop without panic-style volatility</li>
            <li>• Near a 90-day low</li>
            <li>• Premium compression versus spot-derived QAR benchmark</li>
            <li>• Penalties for sharp spikes and abnormal premium widening</li>
          </ul>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Plain-language read</h2>
          <p className="mt-4 text-sm leading-8 text-white/72">{data.recommendation?.explanation ?? "No recommendation is currently available."}</p>
          <p className="mt-4 text-sm leading-8 text-white/72">Confidence is described as {data.recommendation?.confidenceBand?.toLowerCase() ?? "balanced"}, which should be read as a market-quality indicator rather than certainty.</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <h2 className="font-display text-3xl font-semibold text-white">Get notified when the market improves</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">Price drop alerts and weekly summaries are the primary lead magnet at launch. They also create the foundation for future premium alerts and richer analysis tiers.</p>
        <div className="mt-6 max-w-2xl">
          <LeadCaptureForm sourcePage={`/best-time-to-buy/${country}`} countrySlug={country} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related pages</h2>
        <InternalLinksGrid
          items={[
            { href: `/live/${country}/22K`, title: "22K live gold price", description: "Current local price page with long-form SEO sections and chart." },
            { href: `/history/${country}/22K`, title: "22K price history", description: "Longer-term chart plus premium and recommendation history." },
            { href: `/analysis/${country}`, title: `${data.country.name} market analysis`, description: "Country-level analysis hub linking pricing, guides, and insights." },
            { href: `/guides/${country}/buying`, title: `Gold buying guide in ${data.country.name}`, description: "Long-form guide on karats, timing, and buying considerations." },
            { href: "/calculators/should-i-buy-gold-now", title: "Should I buy now? calculator", description: "Use your target price to frame today’s decision." },
            { href: "/alerts", title: "Free gold price drop alerts", description: "Join the launch lead magnet flow." }
          ]}
        />
      </section>

      <FinancialDisclaimer />
    </div>
  );
}
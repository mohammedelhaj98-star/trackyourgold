import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { buildMetadata } from "@/lib/seo";
import { getContentPageBySlug } from "@/server/data/content";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  return buildMetadata({
    title: `Gold buying guide in ${country}`,
    description: `Long-form gold buying guide for ${country}, covering karats, local premiums, timing, and calculators.`,
    path: `/guides/${country}/buying`
  });
}

export default async function BuyingGuidePage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const guide = await getContentPageBySlug(`gold-buying-guide-${country}`);
  if (!guide) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="guide_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Buying guide</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{guide.title}</h1>
        <p className="max-w-3xl text-base leading-8 text-white/72">{guide.summary}</p>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <div className="space-y-5 text-sm leading-8 text-white/72">
          <p>{guide.intro}</p>
          <p>{guide.body}</p>
          <p>When comparing shops, buyers should separate raw gold cost from making charges, look at premium over spot, and think about whether they are buying jewellery, bullion-style pieces, or event-driven gifts.</p>
          <p>TrackYourGold is built to support those decisions with live local data, alerts, calculators, and future store comparison pages across countries and cities.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related tools and pages</h2>
        <InternalLinksGrid
          items={[
            { href: `/live/${country}/22K`, title: "22K live rate", description: "See the latest local price for 22K gold in this market." },
            { href: `/best-time-to-buy/${country}`, title: `Best time to buy in ${guide.country?.name ?? country}`, description: "Timing page built from the recommendation engine." },
            { href: "/calculators/making-charge-calculator", title: "Making charge calculator", description: "Separate labour cost from raw gold value." },
            { href: "/calculators/gold-premium-calculator", title: "Premium calculator", description: "Measure local premium against spot-derived QAR estimate." },
            { href: "/alerts", title: "Gold price alerts", description: "Capture price drop alerts by email from day one." },
            { href: "/gold-insights", title: "Gold Insights hub", description: "More explainers, FAQs, and SEO pages designed for repeat visits." }
          ]}
        />
      </section>

      <FinancialDisclaimer />
    </div>
  );
}
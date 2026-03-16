import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/layout/ad-slot";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { PriceChart } from "@/components/charts/price-chart";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { RecommendationBadge } from "@/components/ui/recommendation-badge";
import { SchemaScript } from "@/components/ui/schema-script";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import { buildBreadcrumbSchema, buildFaqSchema, buildMetadata, buildPricePageSchema } from "@/lib/seo";
import { formatDate, formatPercent, formatQar } from "@/lib/utils";
import { getPricePageData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string; karat: string }> }): Promise<Metadata> {
  const { country, karat } = await params;
  const data = await getPricePageData(country, decodeURIComponent(karat));
  if (!data) return buildMetadata({ title: "Gold price", description: "Gold price page", noIndex: true });

  return buildMetadata({
    title: `${decodeURIComponent(karat)} gold price in ${data.country.name} today`,
    description: data.summary,
    path: `/live/${country}/${karat}`,
    imagePath: `/api/og/price?country=${country}&karat=${encodeURIComponent(karat)}`
  });
}

export default async function LiveGoldPricePage({ params }: { params: Promise<{ country: string; karat: string }> }) {
  const { country, karat } = await params;
  const karatLabel = decodeURIComponent(karat);
  const data = await getPricePageData(country, karatLabel);
  if (!data) notFound();

  const faqItems = data.seoSections.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="price_page" countrySlug={country} />
      <SchemaScript schema={buildPricePageSchema({ title: `${karatLabel} gold price in ${data.country.name} today`, description: data.summary, karat: karatLabel, country: data.country.name, valueQar: data.stats.latestPrice, updatedAt: data.stats.lastUpdatedAt.toISOString(), path: `/live/${country}/${karat}` })} />
      <SchemaScript schema={buildFaqSchema(faqItems)} />
      <SchemaScript schema={buildBreadcrumbSchema([{ name: "Home", item: "/" }, { name: `${karatLabel} in ${data.country.name}`, item: `/live/${country}/${karat}` }])} />
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Live gold price page</p>
          <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">
            {karatLabel} gold price in {data.country.name} today
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/72">{data.summary}</p>
          <div className="flex flex-wrap items-center gap-3">
            <RecommendationBadge label={data.recommendation?.label ?? "WAIT"} />
            <p className="text-sm text-white/60">Updated {formatDate(data.stats.lastUpdatedAt)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Current price" value={formatQar(data.stats.latestPrice)} detail={data.stats.storeName} />
            <MetricCard label="24-hour change" value={formatPercent(data.stats.change24h)} />
            <MetricCard label="7-day change" value={formatPercent(data.stats.change7d)} />
            <MetricCard label="Premium vs spot" value={data.stats.premiumVsSpot !== null ? formatPercent(data.stats.premiumVsSpot) : "n/a"} />
          </div>
        </div>
        <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Price drop alerts</p>
          <h2 className="font-display text-3xl font-semibold text-white">Turn traffic into subscribers</h2>
          <p className="text-sm leading-7 text-white/65">Capture visitors with free price drop alerts, then move them into private dashboards, saved analyses, and future premium upgrades.</p>
          <LeadCaptureForm sourcePage={`/live/${country}/${karat}`} countrySlug={country} />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title={`${karatLabel} price trend`} data={data.chartData.slice(-90)} />
        </div>
        <AdSlot slotKey="desktop-sidebar" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">What the data means</h2>
          <p className="mt-4 text-sm leading-8 text-white/72">TrackYourGold records local store pricing every 30 minutes, stores raw scraper snapshots for debugging, compares local rates with a global spot-derived benchmark, and translates those inputs into a weighted buy/wait label.</p>
          <p className="mt-4 text-sm leading-8 text-white/72">This page is structured to be indexable and useful: chart, update timestamp, premium-over-spot context, FAQ content, calculators, and related pages all live on the same template.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Recent trend interpretation</h2>
          <p className="mt-4 text-sm leading-8 text-white/72">24-hour movement sits at {formatPercent(data.stats.change24h)} and the 7-day move is {formatPercent(data.stats.change7d)}. The current recommendation score is {data.recommendation?.score ?? "n/a"}/100 with {data.recommendation?.confidenceBand?.toLowerCase() ?? "balanced"} conviction.</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/65">
            {data.recommendation?.reasons.map((reason) => (
              <li key={reason.code}>• {reason.reason}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Buying considerations</h2>
        <p className="max-w-4xl text-sm leading-8 text-white/72">A softer entry is more attractive when price is below its trailing averages, premium versus spot is contained, and the market is not coming off a sharp spike. Buyers should also account for making charges, jewellery design premiums, and the intended holding period.</p>
        <SocialShareButtons title={`${karatLabel} gold price in ${data.country.name} today`} path={`/live/${country}/${karat}`} />
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related pages</h2>
        <InternalLinksGrid
          items={[
            { href: `/history/${country}/${karat}`, title: `${karatLabel} price history`, description: "See a longer view of local pricing, premium compression, and recommendation history." },
            { href: `/best-time-to-buy/${country}`, title: `Best time to buy gold in ${data.country.name}`, description: "Timing page built from the same weighted recommendation engine." },
            { href: `/karats/${country}/${karat}`, title: `${karatLabel} karat guide`, description: "Understand purity, use cases, and how this karat compares with alternatives." },
            { href: "/calculators/gold-premium-calculator", title: "Gold premium calculator", description: "Compare local price against a spot-derived benchmark in QAR." },
            { href: "/alerts", title: "Free price drop alerts", description: "Lead magnet page for alert signups and account creation." },
            { href: "/gold-insights", title: "Gold Insights hub", description: "Read more guides, explainers, and market analysis pages." }
          ]}
        />
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Frequently asked questions</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.seoSections.faqs.map((faq) => (
            <div key={faq.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
              <h3 className="font-display text-xl font-semibold text-white">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <FinancialDisclaimer />
    </div>
  );
}
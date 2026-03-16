import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PriceChart } from "@/components/charts/price-chart";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { DataUnavailableState } from "@/components/ui/data-unavailable-state";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { MetricCard } from "@/components/ui/metric-card";
import { RecommendationBadge } from "@/components/ui/recommendation-badge";
import { SchemaScript } from "@/components/ui/schema-script";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";
import { formatPercent, formatQar } from "@/lib/utils";
import { getHistoryPageData } from "@/server/data/market";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ country: string; karat: string }> }): Promise<Metadata> {
  const { country, karat } = await params;
  return buildMetadata({
    title: `${decodeURIComponent(karat)} gold price history in ${country}`,
    description: `Historical tracking, premium-over-spot analysis, and recommendation history for ${decodeURIComponent(karat)} gold in ${country}.`,
    path: `/history/${country}/${karat}`,
    imagePath: `/api/og/price?country=${country}&karat=${encodeURIComponent(karat)}`
  });
}

export default async function HistoryPage({ params }: { params: Promise<{ country: string; karat: string }> }) {
  const { country, karat } = await params;
  const karatLabel = decodeURIComponent(karat);
  const data = await getHistoryPageData(country, karatLabel);
  if (!data) {
    return (
      <DataUnavailableState
        eyebrow="History unavailable"
        title={`${karatLabel} history data is temporarily unavailable.`}
        description="This route is online, but the historical database query could not complete. Once the production database credentials are fixed, historical charts and recommendation history will repopulate automatically."
        primaryHref={`/live/${country}/${karat}`}
        primaryLabel="Open live page"
        secondaryHref="/"
        secondaryLabel="Return home"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="history_page" countrySlug={country} />
      <SchemaScript schema={buildBreadcrumbSchema([{ name: "Home", item: "/" }, { name: "History", item: `/history/${country}/${karat}` }])} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Historical gold trend page</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{karatLabel} gold price history in {data.country.name}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">This page shows long-range movement, premium-over-spot behavior, and recommendation history so visitors can judge whether the current market is calm, stretched, or attractive versus recent norms.</p>
        <div className="flex flex-wrap items-center gap-3">
          <RecommendationBadge label={data.recommendation?.label ?? "WAIT"} />
          <MetricCard label="Current price" value={formatQar(data.stats.latestPrice)} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <MetricCard label="24-hour move" value={formatPercent(data.stats.change24h)} />
        <MetricCard label="7-day move" value={formatPercent(data.stats.change7d)} />
        <MetricCard label="Premium over spot" value={data.stats.premiumVsSpot !== null ? formatPercent(data.stats.premiumVsSpot) : "n/a"} />
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <PriceChart title={`${karatLabel} vs spot-derived benchmark`} data={data.comparisonData.slice(-120)} comparisonKey="spot" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title="Premium over spot" data={data.comparisonData.slice(-120).map((item) => ({ label: item.label, price: item.premium }))} formatValue={(value) => `${value.toFixed(1)}%`} />
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title="Recommendation history" data={data.recommendationHistory.map((item) => ({ label: item.label, price: item.score }))} formatValue={(value) => `${value.toFixed(0)}`} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">What to look for</h2>
          <p className="mt-4 text-sm leading-8 text-white/72">Buyers usually want a calmer trend, contained premium versus spot, and a current price that is not far above the trailing 30-day and 90-day averages. Recommendation history is especially useful because it shows whether value conditions are improving or deteriorating over time.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Recent signal context</h2>
          <p className="mt-4 text-sm leading-8 text-white/72">TrackYourGold currently scores this market at {data.recommendation?.score ?? "n/a"}/100. That score combines price-versus-average checks, spike avoidance, recent downside moves, and premium compression or expansion versus the global benchmark.</p>
        </div>
      </section>

      <FinancialDisclaimer />
    </div>
  );
}

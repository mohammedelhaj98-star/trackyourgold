import { AdSlot } from "@/components/layout/ad-slot";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { PriceChart } from "@/components/charts/price-chart";
import { AdsPreferenceForm } from "@/components/dashboard/forms";
import { MetricCard } from "@/components/ui/metric-card";
import { RecommendationBadge } from "@/components/ui/recommendation-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { decimalToNumber, formatDate, formatPercent, formatQar } from "@/lib/utils";
import { getMarketOverview, getPricePageData } from "@/server/data/market";

export const metadata = buildMetadata({
  title: "Dashboard",
  description: "Private dashboard for TrackYourGold users.",
  path: "/dashboard",
  noIndex: true
});

export default async function DashboardPage() {
  const [user, overview, featured] = await Promise.all([getCurrentUser(), getMarketOverview("qatar"), getPricePageData("qatar", "22K")]);
  if (!user || !overview || !featured) return null;

  const globalSeries = await db.globalGoldPrice.findMany({
    where: { countryId: featured.country.id },
    orderBy: { capturedAt: "asc" },
    take: featured.chartData.length
  });

  const primaryCards = overview.cards.filter((card) => ["22K", "24K"].includes(card.karatLabel));
  const extraCards = overview.cards.filter((card) => !["22K", "24K"].includes(card.karatLabel));
  const premiumChartData = featured.chartData.slice(-60).map((item, index) => {
    const global = globalSeries.at(globalSeries.length - featured.chartData.slice(-60).length + index);
    const premium = global ? ((Number(item.price) - decimalToNumber(global.qarPerGramEstimate)) / decimalToNumber(global.qarPerGramEstimate)) * 100 : 0;
    return {
      label: item.label,
      price: premium
    };
  });

  return (
    <div className="space-y-8">
      <PageViewTracker routeType="dashboard" countrySlug="qatar" />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">User dashboard</p>
        <h1 className="font-display text-4xl font-semibold text-white">Track Qatar gold with private tools and alerts</h1>
        <div className="flex items-center gap-3">
          <RecommendationBadge label={featured.recommendation?.label ?? "WAIT"} />
          <p className="text-sm text-white/60">Last platform refresh {formatDate(overview.lastUpdatedAt ?? new Date())}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-6">
        {primaryCards.map((card) => (
          <MetricCard
            key={card.karatLabel}
            label={`${card.karatLabel} live`}
            value={formatQar(card.pricePerGram)}
            detail={`${formatPercent(card.change24h)} 24h | ${formatPercent(card.change7d)} 7d`}
          />
        ))}
        <MetricCard label="Premium vs spot" value={featured.stats.premiumVsSpot !== null ? formatPercent(featured.stats.premiumVsSpot) : "n/a"} />
        <MetricCard label="Recommendation score" value={`${featured.recommendation?.score ?? "n/a"}`} detail={featured.recommendation?.confidenceBand} />
        {extraCards.map((card) => (
          <MetricCard key={card.karatLabel} label={card.karatLabel} value={formatQar(card.pricePerGram)} detail="Dynamic karat detected" />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title="Intraday and recent trend" data={featured.chartData.slice(-60)} />
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title="Premium over spot trend" data={premiumChartData} formatValue={(value) => `${value.toFixed(1)}%`} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Signal breakdown</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            {featured.recommendation?.reasons.map((reason) => (
              <li key={reason.code}>• {reason.reason}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <AdsPreferenceForm adsSuppressed={user.adsSuppressed} />
          <AdSlot slotKey="dashboard-inline" />
        </div>
      </section>
    </div>
  );
}



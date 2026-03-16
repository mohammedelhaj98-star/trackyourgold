import Link from "next/link";

import { PriceChart } from "@/components/charts/price-chart";
import { AdSlot } from "@/components/layout/ad-slot";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { DataUnavailableState } from "@/components/ui/data-unavailable-state";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { RecommendationBadge } from "@/components/ui/recommendation-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMarketOverview, getPricePageData, getContentHubData } from "@/server/data/market";
import { Button } from "@/components/ui/button";
import { formatDate, formatPercent, formatQar } from "@/lib/utils";

export const revalidate = 1800;

export default async function HomePage() {
  const [overview, featured, hub] = await Promise.all([
    getMarketOverview("qatar"),
    getPricePageData("qatar", "22K"),
    getContentHubData()
  ]);

  if (!overview || !featured) {
    return (
      <DataUnavailableState
        eyebrow="Live data unavailable"
        title="TrackYourGold is online, but the market database is temporarily unavailable."
        description="Public pages remain reachable while we restore the live pricing connection. Login and registration still work, and the protected setup route can be used once the production database credentials are corrected."
        primaryHref="/login"
        primaryLabel="Open login"
        secondaryHref="/register"
        secondaryLabel="Create account"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="homepage" countrySlug="qatar" />
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">SEO growth + financial product</p>
            <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Track Qatar gold rates, compare spot premiums, and turn repeat traffic into alerts, accounts, and premium readiness.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-white/72 md:text-lg">
              TrackYourGold monitors Malabar Gold & Diamonds Qatar every 30 minutes, compares store pricing with a global spot-derived benchmark, and turns that data into SEO pages, private tools, and monetizable user flows.
            </p>
          </div>
          <LeadCaptureForm sourcePage="/" compact />
          <div className="grid gap-4 md:grid-cols-3">
            {overview.cards.slice(0, 3).map((card) => (
              <MetricCard
                key={card.karatLabel}
                label={`${card.karatLabel} live rate`}
                value={formatQar(card.pricePerGram)}
                detail={`${formatPercent(card.change24h)} in 24h`}
                footer={<RecommendationBadge label={card.recommendation?.label ?? "WAIT"} />}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Launch metrics</p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/55">Current featured price</p>
              <p className="mt-2 font-display text-4xl font-semibold text-white">{formatQar(featured.stats.latestPrice)}</p>
              <p className="mt-2 text-sm text-white/65">22K in Qatar, last refreshed {formatDate(featured.stats.lastUpdatedAt)}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Premium vs spot</p>
                <p className="mt-2 text-xl font-semibold text-white">{featured.stats.premiumVsSpot !== null ? formatPercent(featured.stats.premiumVsSpot) : "n/a"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Recommendation</p>
                <div className="mt-3"><RecommendationBadge label={featured.recommendation?.label ?? "WAIT"} /></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/live/qatar/22K">Open live price page</Button>
              <Button href="/register" variant="secondary">Create free account</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <PriceChart title="Featured 22K trend" data={featured.chartData.slice(-45)} />
        </div>
        <AdSlot slotKey="desktop-sidebar" />
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Monetizable information architecture"
          title="Public templates built to rank and convert"
          description="The app ships with indexable price pages, historical trend pages, best-time pages, calculators, guides, store pages, and content hubs designed to grow search traffic and convert it into leads and accounts."
        />
        <InternalLinksGrid
          items={[
            { href: "/live/qatar/22K", title: "22KT gold price in Qatar today", description: "Indexable live price page with chart, recommendation, FAQ blocks, and lead capture." },
            { href: "/history/qatar/22K", title: "22K gold price history in Qatar", description: "Historical trend page with recommendation history and premium-over-spot analysis." },
            { href: "/best-time-to-buy/qatar", title: "Best time to buy gold in Qatar", description: "High-intent timing page powered by the recommendation engine." },
            { href: "/guides/qatar/buying", title: "Gold buying guide in Qatar", description: "Long-form guide template that supports internal linking and SEO depth." },
            { href: "/calculators/should-i-buy-gold-now", title: "Should I buy gold now? calculator", description: "Dedicated SEO calculator page that nudges account creation and alert signups." },
            { href: "/alerts", title: "Free gold price drop alerts", description: "Lead magnet landing page for price-drop alerts and email capture." }
          ]}
        />
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Gold Insights"
          title="Content hub for trust, education, and repeat traffic"
          description="Learn pages connect articles, FAQs, guides, and calculators so the platform can scale into country, city, karat, and store search demand over time."
          action={<Button href="/gold-insights" variant="secondary">View hub</Button>}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {hub.articles.slice(0, 3).map((article) => (
            <Link key={article.slug} href={`/gold-insights/${article.slug}`} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel transition hover:border-gold-300/30">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-200">Article</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <FinancialDisclaimer />
    </div>
  );
}

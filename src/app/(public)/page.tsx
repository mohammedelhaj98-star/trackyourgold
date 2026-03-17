import { Button } from "@/components/ui/button";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-10 lg:px-8 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">TrackYourGold</p>
            <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Gold intelligence for Qatar today, global expansion tomorrow.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-white/72 md:text-lg">
              Follow live Qatar pricing, compare store rates against spot-derived benchmarks, and use TrackYourGold as the
              public front door for alerts, accounts, calculators, and future premium tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/live/qatar/22K">Open live 22K price</Button>
            <Button href="/alerts" variant="secondary">Get free price alerts</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Live rate tracking"
              value="Qatar"
              detail="Public live price pages stay available even when the private database is under maintenance."
            />
            <MetricCard
              label="Buy signal engine"
              value="4 labels"
              detail="Strong Buy, Buy, Wait, and Avoid are generated from tracked rate behavior and spot premium."
            />
            <MetricCard
              label="Portfolio tools"
              value="Accounts"
              detail="Registration unlocks alerts, calculators, and personal tracking without relying on ads."
            />
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Start here</p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/55">Fastest working route</p>
              <p className="mt-2 font-display text-4xl font-semibold text-white">22K live page</p>
              <p className="mt-2 text-sm text-white/65">
                Use the live Qatar route for the current tracked price, chart data, and recommendation summary.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Primary route</p>
                <p className="mt-2 text-xl font-semibold text-white">/live/qatar/22K</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">API route</p>
                <p className="mt-2 text-xl font-semibold text-white">/api/chart-data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Built to rank and convert"
          title="Public pages, tools, and account flows in one architecture"
          description="TrackYourGold is designed as an SEO-first product: live pricing pages bring traffic in, alerts and accounts capture demand, and calculators and guides create depth for search and repeat visits."
        />
        <InternalLinksGrid
          items={[
            {
              href: "/live/qatar/22K",
              title: "22K gold price in Qatar today",
              description: "Live route with the real tracked price, recommendation summary, and chart payload."
            },
            {
              href: "/history/qatar/22K",
              title: "22K gold price history in Qatar",
              description: "Historical trend view for local gold prices and recommendation history."
            },
            {
              href: "/best-time-to-buy/qatar",
              title: "Best time to buy gold in Qatar",
              description: "A timing-focused landing page based on the same recommendation engine."
            },
            {
              href: "/calculators/qar-gold-calculator",
              title: "QAR gold calculator",
              description: "Tool page for buyers comparing grams, rates, and local totals."
            },
            {
              href: "/gold-insights",
              title: "Gold Insights",
              description: "Content hub for explainers, guides, and market context."
            },
            {
              href: "/alerts",
              title: "Free price drop alerts",
              description: "Lead-capture route for alert signups and account creation."
            }
          ]}
        />
      </section>

      <FinancialDisclaimer />
    </div>
  );
}

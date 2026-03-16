import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Get free gold price drop alerts",
  description: "Lead magnet page for free gold price drop alerts, weekly summaries, and account creation.",
  path: "/alerts"
});

export default function AlertsLeadPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="lead_magnet" countrySlug="qatar" />
      <section className="space-y-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Lead magnet</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Get free gold price drop alerts</h1>
        <p className="mx-auto max-w-3xl text-base leading-8 text-white/72">Sign up for price drop alerts, new 90-day low notifications, and weekly summaries. This page is built to convert SEO traffic into email subscribers and future account registrations.</p>
      </section>
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <LeadCaptureForm sourcePage="/alerts" countrySlug="qatar" />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-white">Price drop alerts</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">Get notified when the local tracked rate moves down by your target threshold.</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-white">Weekly summaries</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">Receive recent rates, trend context, recommendation labels, and premium versus spot updates.</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-white">Dashboard upgrade path</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">Alerts flow naturally into private tools, saved analyses, portfolio tracking, and future premium features.</p>
        </div>
      </section>
      <InternalLinksGrid
        items={[
          { href: "/register", title: "Create free account", description: "Unlock the private dashboard and save tools." },
          { href: "/live/qatar/22K", title: "22K live price page", description: "See the latest tracked price before subscribing." },
          { href: "/best-time-to-buy/qatar", title: "Best time to buy", description: "Read the timing page behind the alert logic." },
          { href: "/gold-insights", title: "Gold Insights hub", description: "Continue exploring public pages that reinforce trust and SEO depth." }
        ]}
      />
    </div>
  );
}
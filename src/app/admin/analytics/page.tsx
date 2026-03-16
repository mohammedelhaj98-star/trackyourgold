import { buildMetadata } from "@/lib/seo";
import { getAdminAnalyticsData } from "@/server/data/admin";

export const metadata = buildMetadata({
  title: "Analytics",
  description: "Internal analytics review dashboard.",
  path: "/admin/analytics",
  noIndex: true
});

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsData();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Internal analytics</p>
        <h1 className="font-display text-4xl font-semibold text-white">Traffic, signup, and affiliate insights</h1>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Most viewed pages</h2>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            {analytics.pageViews.map((row) => (
              <div key={row.path} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{row.path}</p>
                <p className="mt-2">Views: {row._count.path}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Best converting lead pages</h2>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            {analytics.signups.map((row) => (
              <div key={row.sourcePage ?? 'unknown'} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{row.sourcePage ?? "unknown"}</p>
                <p className="mt-2">Lead signups: {row._count.sourcePage ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Affiliate clicks</h2>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            {analytics.affiliateClicks.map((row) => (
              <div key={row.pagePath} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{row.pagePath}</p>
                <p className="mt-2">Clicks: {row._count.pagePath}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Registration sources</h2>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            {analytics.registrations.map((row) => (
              <div key={row.sourcePage ?? 'unknown'} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{row.sourcePage ?? "unknown"}</p>
                <p className="mt-2">Registrations: {row._count.sourcePage ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

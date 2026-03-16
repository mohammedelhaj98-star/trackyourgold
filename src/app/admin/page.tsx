import { ArticleEditor, ContentPageEditor, SettingEditor } from "@/components/admin/forms";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { MetricCard } from "@/components/ui/metric-card";
import { buildMetadata } from "@/lib/seo";
import { getAdminDashboardData } from "@/server/data/admin";

export const metadata = buildMetadata({
  title: "Admin dashboard",
  description: "TrackYourGold admin overview.",
  path: "/admin",
  noIndex: true
});

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <PageViewTracker routeType="admin_dashboard" countrySlug="qatar" />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Admin overview</p>
        <h1 className="font-display text-4xl font-semibold text-white">System, content, and monetization controls</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Users" value={`${data.users.length}`} />
        <MetricCard label="Published pages" value={`${data.publishedPages}`} />
        <MetricCard label="Ad slots" value={`${data.adSlots.length}`} />
        <MetricCard label="Parser failures" value={`${data.parserFailures.length}`} />
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <SettingEditor />
        <ArticleEditor />
        <ContentPageEditor />
      </section>
    </div>
  );
}

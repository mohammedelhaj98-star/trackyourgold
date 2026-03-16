import { AlertRuleForm } from "@/components/dashboard/forms";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Alert settings",
  description: "Configure alert rules and review recent alert events.",
  path: "/alerts/settings",
  noIndex: true
});

export default async function AlertSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [rules, events] = await Promise.all([
    db.alertRule.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
    db.alertEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 })
  ]);

  return (
    <div className="space-y-8">
      <PageViewTracker routeType="alerts_settings" countrySlug="qatar" />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Alerts</p>
        <h1 className="font-display text-4xl font-semibold text-white">Alert settings and event history</h1>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <h2 className="font-display text-3xl font-semibold text-white">Active rules</h2>
            <div className="mt-5 space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  <p className="font-semibold text-white">{rule.type.replaceAll("_", " ")} {rule.karatLabel ? `for ${rule.karatLabel}` : ""}</p>
                  <p className="mt-2">Email: {rule.emailEnabled ? "On" : "Off"} | Dashboard: {rule.dashboardEnabled ? "On" : "Off"}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <h2 className="font-display text-3xl font-semibold text-white">Recent events</h2>
            <div className="mt-5 space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-2">{event.body}</p>
                  <p className="mt-2 text-white/45">{event.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AlertRuleForm />
      </section>
    </div>
  );
}
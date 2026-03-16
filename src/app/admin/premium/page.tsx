import { SettingEditor } from "@/components/admin/forms";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Premium settings",
  description: "Premium architecture toggle and settings.",
  path: "/admin/premium",
  noIndex: true
});

export default async function AdminPremiumPage() {
  const settings = await db.setting.findMany({ where: { groupName: "premium" }, orderBy: { key: "asc" } });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Premium architecture</p>
        <h1 className="font-display text-4xl font-semibold text-white">Launch toggle and future paywall controls</h1>
        <p className="max-w-4xl text-sm leading-8 text-white/72">Premium is architected from day one even if checkout is disabled. Toggle settings here before enabling advanced buy signals, richer alerts, and premium-only analysis pages.</p>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="space-y-4 text-sm text-white/70">
          {settings.map((setting) => (
            <div key={setting.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">{setting.key}</p>
              <p className="mt-2">{setting.value}</p>
            </div>
          ))}
        </div>
      </div>
      <SettingEditor />
    </div>
  );
}

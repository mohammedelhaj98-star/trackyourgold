import { SettingEditor } from "@/components/admin/forms";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Scraper settings",
  description: "Scraper configuration and operational notes.",
  path: "/admin/scraper",
  noIndex: true
});

export default async function AdminScraperPage() {
  const settings = await db.setting.findMany({ where: { groupName: "scraper" }, orderBy: { key: "asc" } });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Scraper settings</p>
        <h1 className="font-display text-4xl font-semibold text-white">Malabar ingestion controls</h1>
        <p className="max-w-4xl text-sm leading-8 text-white/72">Update parser selectors in <code>src/server/services/pricing/malabar-config.ts</code> and keep the parser version in sync in the environment or admin settings.</p>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="space-y-3 text-sm text-white/70">
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

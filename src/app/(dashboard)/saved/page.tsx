import { SavedAnalysisForm } from "@/components/dashboard/forms";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Saved analyses",
  description: "Store notes and watchlist-style analysis items.",
  path: "/saved",
  noIndex: true
});

export default async function SavedAnalysisPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const analyses = await db.savedAnalysis.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <PageViewTracker routeType="saved_analyses" countrySlug="qatar" />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Saved analysis</p>
        <h1 className="font-display text-4xl font-semibold text-white">Watchlist notes and saved theses</h1>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-200">{analysis.karatLabel}</p>
              <p className="mt-3 text-sm leading-7 text-white/70">{analysis.note ?? "No note recorded."}</p>
            </div>
          ))}
        </div>
        <SavedAnalysisForm />
      </section>
    </div>
  );
}

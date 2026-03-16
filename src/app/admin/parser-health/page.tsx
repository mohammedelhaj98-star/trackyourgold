import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Parser health",
  description: "Monitor parser failures and raw snapshot health.",
  path: "/admin/parser-health",
  noIndex: true
});

export default async function ParserHealthPage() {
  const [failures, snapshots] = await Promise.all([
    db.parserFailure.findMany({ include: { store: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.rawScrapeSnapshot.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { store: true } })
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Parser health</p>
        <h1 className="font-display text-4xl font-semibold text-white">Failures, snapshots, and recovery context</h1>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Recent failures</h2>
          <div className="mt-5 space-y-4 text-sm text-white/70">
            {failures.map((failure) => (
              <div key={failure.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{failure.store.name}</p>
                <p className="mt-2">{failure.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h2 className="font-display text-3xl font-semibold text-white">Raw scrape snapshots</h2>
          <div className="mt-5 space-y-4 text-sm text-white/70">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{snapshot.store.name}</p>
                <p className="mt-2">Status: {snapshot.status}</p>
                <p className="mt-2">Parser version: {snapshot.parserVersion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

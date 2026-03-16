import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "System logs",
  description: "System log and operational review page.",
  path: "/admin/logs",
  noIndex: true
});

export default async function AdminLogsPage() {
  const logs = await db.systemLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">System logs</p>
        <h1 className="font-display text-4xl font-semibold text-white">Operational events and failures</h1>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="space-y-4 text-sm text-white/70">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">[{log.level}] {log.category}</p>
              <p className="mt-2">{log.message}</p>
              <p className="mt-2 text-white/45">{log.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

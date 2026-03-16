import { ContentPageEditor } from "@/components/admin/forms";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "SEO content",
  description: "Manage content pages and SEO architecture.",
  path: "/admin/seo",
  noIndex: true
});

export default async function AdminSeoPage() {
  const pages = await db.contentPage.findMany({ orderBy: { updatedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">SEO content</p>
        <h1 className="font-display text-4xl font-semibold text-white">Generated pages and long-form templates</h1>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="space-y-4 text-sm text-white/70">
          {pages.map((page) => (
            <div key={page.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">{page.title}</p>
              <p className="mt-2">/{page.slug}</p>
            </div>
          ))}
        </div>
      </div>
      <ContentPageEditor />
    </div>
  );
}

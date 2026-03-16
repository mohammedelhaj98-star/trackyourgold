import { ArticleEditor } from "@/components/admin/forms";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Articles",
  description: "Manage scheduled and published articles.",
  path: "/admin/articles",
  noIndex: true
});

export default async function AdminArticlesPage() {
  const articles = await db.blogArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 20 });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Articles</p>
        <h1 className="font-display text-4xl font-semibold text-white">Blog and market explainer management</h1>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="space-y-4 text-sm text-white/70">
          {articles.map((article) => (
            <div key={article.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">{article.title}</p>
              <p className="mt-2">Status: {article.status}</p>
            </div>
          ))}
        </div>
      </div>
      <ArticleEditor />
    </div>
  );
}

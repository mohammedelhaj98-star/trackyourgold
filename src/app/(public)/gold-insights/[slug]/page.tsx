import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import { SchemaScript } from "@/components/ui/schema-script";
import { buildArticleSchema, buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getPublishedArticle } from "@/server/data/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return buildMetadata({ title: "Article", description: "Article page", noIndex: true });
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/gold-insights/${slug}`,
    imagePath: "/api/og/price?country=qatar&karat=22K"
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="article_page" countrySlug={article.country?.slug ?? "qatar"} />
      <SchemaScript schema={buildArticleSchema({ title: article.title, description: article.excerpt, path: `/gold-insights/${slug}`, publishedAt: (article.publishedAt ?? article.createdAt).toISOString() })} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Gold Insights</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{article.title}</h1>
        <p className="text-sm text-white/60">Published {formatDate(article.publishedAt ?? article.createdAt, "MMM d, yyyy")}</p>
        <p className="text-base leading-8 text-white/72">{article.excerpt}</p>
      </section>
      <article className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <div className="space-y-5 text-sm leading-8 text-white/72">
          <p>{article.body}</p>
          <p>TrackYourGold uses this content layer to support organic traffic acquisition, trust-building, and internal linking back into live pricing tools and lead-capture flows.</p>
        </div>
      </article>
      <SocialShareButtons title={article.title} path={`/gold-insights/${slug}`} />
      <FinancialDisclaimer />
    </div>
  );
}
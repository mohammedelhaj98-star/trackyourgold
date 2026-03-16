import Link from "next/link";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getContentHubData } from "@/server/data/market";

export const revalidate = 1800;

export const metadata = buildMetadata({
  title: "Gold Insights hub",
  description: "Content hub linking articles, guides, and FAQs for TrackYourGold.",
  path: "/gold-insights"
});

export default async function GoldInsightsHub() {
  const hub = await getContentHubData();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="content_hub" countrySlug="qatar" />
      <SectionHeading
        eyebrow="Learn about gold"
        title="Gold Insights"
        description="A content hub designed for SEO growth, trust-building, and repeat traffic across articles, guides, FAQs, and calculators."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {hub.articles.map((article) => (
          <Link key={article.slug} href={`/gold-insights/${article.slug}`} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel transition hover:border-gold-300/30">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-200">Article</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">{article.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{article.excerpt}</p>
          </Link>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {hub.guides.map((guide) => (
          <div key={guide.slug} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-200">Guide</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">{guide.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{guide.summary}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

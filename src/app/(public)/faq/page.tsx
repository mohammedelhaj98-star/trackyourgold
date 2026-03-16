import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { buildFaqSchema, buildMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/ui/schema-script";
import { getFaqHubData } from "@/server/data/content";

export const metadata = buildMetadata({
  title: "Gold FAQ hub",
  description: "Frequently asked questions about gold prices, karats, alerts, and buying decisions.",
  path: "/faq"
});

export default async function FaqHubPage() {
  const faqs = await getFaqHubData();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="faq_hub" countrySlug="qatar" />
      <SchemaScript schema={buildFaqSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">FAQ hub</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">Gold price FAQ</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">FAQ pages add indexable long-tail content, support schema markup, and answer common trust and buying questions that appear across public pricing pages.</p>
      </section>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-200">{faq.category ?? "General"}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">{faq.question}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
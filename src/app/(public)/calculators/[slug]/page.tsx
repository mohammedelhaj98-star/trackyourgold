import { notFound } from "next/navigation";

import { CalculatorForm } from "@/components/forms/calculator-form";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { SchemaScript } from "@/components/ui/schema-script";
import { buildCalculatorSchema, buildMetadata } from "@/lib/seo";
import { getCalculatorBySlug } from "@/lib/calculators";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) return buildMetadata({ title: "Calculator", description: "Calculator page", noIndex: true });
  return buildMetadata({
    title: calculator.title,
    description: calculator.description,
    path: `/calculators/${slug}`
  });
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="calculator_page" countrySlug="qatar" />
      <SchemaScript schema={buildCalculatorSchema({ title: calculator.title, description: calculator.description, path: `/calculators/${slug}` })} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">SEO calculator page</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{calculator.title}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">{calculator.description} {calculator.intro}</p>
      </section>
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <CalculatorForm calculator={calculator} />
      </section>
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related conversion paths</h2>
        <InternalLinksGrid
          items={[
            { href: "/register", title: "Create free account", description: "Unlock private tools, portfolio tracking, and saved alerts." },
            { href: "/alerts", title: "Get price drop alerts", description: "Turn calculator visitors into newsletter and alert subscribers." },
            { href: "/live/qatar/22K", title: "Live gold price", description: "Pair your calculation with the latest local tracked rates." },
            { href: "/gold-insights", title: "Gold Insights", description: "Continue into educational content and buying guides." }
          ]}
        />
      </section>
      <FinancialDisclaimer />
    </div>
  );
}
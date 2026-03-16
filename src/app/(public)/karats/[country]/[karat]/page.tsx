import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { buildMetadata } from "@/lib/seo";
import { formatQar } from "@/lib/utils";
import { getPricePageData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string; karat: string }> }): Promise<Metadata> {
  const { country, karat } = await params;
  return buildMetadata({
    title: `${decodeURIComponent(karat)} gold explained in ${country}`,
    description: `Karat explainer page for ${decodeURIComponent(karat)} gold in ${country}, with local rate context and related buying pages.`,
    path: `/karats/${country}/${karat}`
  });
}

export default async function KaratExplainerPage({ params }: { params: Promise<{ country: string; karat: string }> }) {
  const { country, karat } = await params;
  const karatLabel = decodeURIComponent(karat);
  const data = await getPricePageData(country, karatLabel);
  if (!data) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="karat_page" countrySlug={country} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Karat explainer</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">What {karatLabel} gold means in {data.country.name}</h1>
        <p className="max-w-4xl text-base leading-8 text-white/72">Karat pages support SEO scale by combining educational content with live local pricing, related calculators, and internal links to buying-intent pages.</p>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <div className="space-y-5 text-sm leading-8 text-white/72">
          <p>{karatLabel} gold currently tracks at about {formatQar(data.stats.latestPrice)} per gram in {data.country.name}. This makes the page useful both for education and for real-time shopping context.</p>
          <p>Higher karat gold generally means higher purity. Buyers in Qatar often balance purity against jewellery durability, resale expectations, and making charge sensitivity.</p>
          <p>TrackYourGold keeps these pages indexable by pairing chart-driven local data with plain-language explanations and related shopping tools.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold text-white">Related pages</h2>
        <InternalLinksGrid
          items={[
            { href: `/live/${country}/${karat}`, title: `${karatLabel} live price`, description: "See the current local rate and recommendation label." },
            { href: `/history/${country}/${karat}`, title: `${karatLabel} price history`, description: "Track longer-term movement and premium behavior." },
            { href: `/best-time-to-buy/${country}`, title: `Best time to buy in ${data.country.name}`, description: "Timing page powered by local trend scoring." },
            { href: "/calculators/qar-gold-calculator", title: "QAR gold calculator", description: "Estimate total cost from grams and price per gram." },
            { href: "/calculators/making-charge-calculator", title: "Making charge calculator", description: "Understand labour costs separately from gold value." },
            { href: "/alerts", title: "Free price drop alerts", description: "Capture alerts for this market and karat." }
          ]}
        />
      </section>

      <FinancialDisclaimer />
    </div>
  );
}
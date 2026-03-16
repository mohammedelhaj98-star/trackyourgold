import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceChart } from "@/components/charts/price-chart";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { decimalToNumber, formatQar } from "@/lib/utils";
import { getStorePageData } from "@/server/data/market";

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string; slug: string }> }): Promise<Metadata> {
  const { country, city, slug } = await params;
  return buildMetadata({
    title: `${slug.replaceAll("-", " ")} gold store page`,
    description: `Store directory page for ${slug.replaceAll("-", " ")} in ${city}, ${country}.`,
    path: `/stores/${country}/${city}/${slug}`
  });
}

export default async function StorePage({ params }: { params: Promise<{ country: string; city: string; slug: string }> }) {
  const { country, city, slug } = await params;
  const data = await getStorePageData(country, city, slug);
  if (!data) notFound();

  const chartData = [...data.store.snapshots].reverse().map((item) => ({
    label: item.capturedAt.toISOString().slice(5, 10),
    price: decimalToNumber(item.pricePerGram)
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8 lg:py-16">
      <PageViewTracker routeType="store_page" countrySlug={country} />
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Store directory page</p>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{data.store.name}</h1>
          <p className="max-w-4xl text-base leading-8 text-white/72">Store pages are affiliate-ready from day one. They support outbound links, future ratings, city-country hierarchy, and richer comparison modules without requiring a database redesign.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Affiliate-ready</p>
          <p className="mt-3 text-sm leading-7 text-white/65">Outbound links can be geo-targeted later. This record already supports partner network fields and future store recommendation cards.</p>
          {data.store.affiliateLinks[0] ? (
            <Button href={data.store.affiliateLinks[0].url} variant="secondary" className="mt-5">Visit store</Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <PriceChart title="Recent tracked store prices" data={chartData} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Primary source</p>
          <p className="mt-3 text-2xl font-semibold text-white">{data.store.isPrimarySource ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Latest tracked rate</p>
          <p className="mt-3 text-2xl font-semibold text-white">{data.store.snapshots[0] ? formatQar(decimalToNumber(data.store.snapshots[0].pricePerGram)) : "n/a"}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Expansion-ready fields</p>
          <p className="mt-3 text-2xl font-semibold text-white">Affiliate + SEO</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/countries/${country}`} className="text-sm text-white/70 hover:text-white">Back to country</Link>
        <Link href={`/compare/${country}/${city}`} className="text-sm text-white/70 hover:text-white">Store comparison</Link>
      </div>
    </div>
  );
}
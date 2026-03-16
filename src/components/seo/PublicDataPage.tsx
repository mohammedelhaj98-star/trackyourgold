import Link from 'next/link';
import { FinancialDisclaimer } from '@/components/shared/FinancialDisclaimer';
import { AdSlot } from '@/components/ads/AdSlot';

export function PublicDataPage({ title, country = 'Qatar', intro }: { title: string; country?: string; intro: string }) {
  return (
    <main className="container-page space-y-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-slate-300">{intro}</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <article className="card">Chart and trend module placeholder for {country}.</article>
          <article className="card">What the data means, trend interpretation, buying considerations, and dynamic FAQ blocks.</article>
          <article className="card">
            Related pages: <Link className="underline" href={`/best-time/${country.toLowerCase()}`}>Best time to buy</Link>
          </article>
        </section>
        <AdSlot slotKey="desktop_sidebar" />
      </div>
      <FinancialDisclaimer />
    </main>
  );
}

import Link from 'next/link';
import { FinancialDisclaimer } from '@/components/shared/FinancialDisclaimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { getLatestMarketView } from '@/lib/data/market';

export async function PublicDataPage({ title, country = 'Qatar', intro }: { title: string; country?: string; intro: string }) {
  const countryCode = country.toUpperCase() === 'QATAR' ? 'QA' : country.slice(0, 2).toUpperCase();
  const market = await getLatestMarketView(countryCode);

  return (
    <main className="container-page space-y-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-slate-300">{intro}</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <article className="card">
            <h2 className="mb-2 text-xl font-semibold">Latest prices ({market.source})</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {market.prices.map((p) => (
                <div key={p.karatCode} className="rounded border border-slate-700 p-3">
                  <p className="text-sm text-slate-300">{p.karatCode}</p>
                  <p className="text-lg font-semibold">QAR {p.pricePerGram.toFixed(3)} / g</p>
                  <p className="text-xs text-slate-400">Premium vs spot: {market.premiumPercentByKarat[p.karatCode]}%</p>
                </div>
              ))}
            </div>
          </article>
          <article className="card">
            <h3 className="font-semibold">Recommendation: {market.recommendation.label.replaceAll('_', ' ')}</h3>
            <p className="text-slate-300">Score: {market.recommendation.score}/100</p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
              {market.recommendation.reasons.map((r) => (<li key={r}>{r}</li>))}
            </ul>
          </article>
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

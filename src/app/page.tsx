import Link from 'next/link';
import { FinancialDisclaimer } from '@/components/shared/FinancialDisclaimer';
import { LeadCaptureForm } from '@/components/forms/LeadCaptureForm';

export default function HomePage() {
  return (
    <main className="container-page space-y-8">
      <section className="card grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-brand">TrackYourGold</p>
          <h1 className="text-4xl font-semibold">Gold intelligence for Qatar today, global expansion tomorrow.</h1>
          <p className="mt-3 text-slate-300">SEO-ready public pages, user tools, alerts, and premium architecture in one platform.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/gold/qatar" className="rounded bg-brand px-4 py-2 text-black">Live Gold Price</Link>
            <Link href="/alerts/price-drop" className="rounded border border-slate-700 px-4 py-2">Get Free Alerts</Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Free price drop alerts</h2>
          <p className="mb-3 text-sm text-slate-300">Capture SEO traffic and convert visitors into leads from day one.</p>
          <LeadCaptureForm sourcePage="home" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {['Live rates', 'Buy signal engine', 'Portfolio tracking'].map((item) => (
          <article key={item} className="card"><h3 className="font-semibold">{item}</h3></article>
        ))}
      </section>
      <FinancialDisclaimer />
    </main>
  );
}

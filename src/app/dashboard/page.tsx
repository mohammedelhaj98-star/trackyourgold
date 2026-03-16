import { AdSlot } from '@/components/ads/AdSlot';
import { getLatestMarketView } from '@/lib/data/market';

export default async function DashboardPage() {
  const market = await getLatestMarketView('QA');
  const p22 = market.prices.find((p) => p.karatCode === '22KT');
  const p24 = market.prices.find((p) => p.karatCode === '24KT');

  return (
    <main className="container-page space-y-4">
      <h1 className="text-3xl font-semibold">User Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">22KT: {p22 ? `QAR ${p22.pricePerGram.toFixed(3)}` : 'N/A'}</div>
        <div className="card">24KT: {p24 ? `QAR ${p24.pricePerGram.toFixed(3)}` : 'N/A'}</div>
        <div className="card">Recommendation: {market.recommendation.label.replaceAll('_', ' ')}</div>
      </div>
      <div className="card text-sm text-slate-300">Global estimate: QAR {market.globalQarPerGram.toFixed(3)} / g · Source: {market.source}</div>
      <AdSlot slotKey="dashboard_slot" isAuthenticated={false} />
    </main>
  );
}

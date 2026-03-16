import { AdSlot } from '@/components/ads/AdSlot';

export default function DashboardPage() {
  return (
    <main className="container-page space-y-4">
      <h1 className="text-3xl font-semibold">User Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">{['22KT', '24KT', 'Recommendation'].map((c) => <div key={c} className="card">{c} card</div>)}</div>
      <AdSlot slotKey="dashboard_slot" isAuthenticated={false} />
    </main>
  );
}

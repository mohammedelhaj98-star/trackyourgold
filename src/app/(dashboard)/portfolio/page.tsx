import { PurchaseForm } from "@/components/dashboard/forms";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { MetricCard } from "@/components/ui/metric-card";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { decimalToNumber, formatQar } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Portfolio tracker",
  description: "Track purchases, cost basis, and unrealized performance.",
  path: "/portfolio",
  noIndex: true
});

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [purchases, latestSnapshots] = await Promise.all([
    db.purchase.findMany({ where: { userId: user.id }, orderBy: { purchasedAt: "desc" } }),
    db.goldPriceSnapshot.findMany({ where: { countryId: user.countryId ?? undefined }, orderBy: { capturedAt: "desc" }, take: 20 })
  ]);

  const latestByKarat = new Map<string, number>();
  for (const snapshot of latestSnapshots) {
    if (!latestByKarat.has(snapshot.karatLabel)) latestByKarat.set(snapshot.karatLabel, decimalToNumber(snapshot.pricePerGram));
  }

  const totalSpent = purchases.reduce((sum, purchase) => sum + decimalToNumber(purchase.totalPaid), 0);
  const totalGrams = purchases.reduce((sum, purchase) => sum + decimalToNumber(purchase.grams), 0);
  const currentValue = purchases.reduce((sum, purchase) => sum + decimalToNumber(purchase.grams) * (latestByKarat.get(purchase.karatLabel) ?? decimalToNumber(purchase.pricePerGram)), 0);
  const profitLoss = currentValue - totalSpent;
  const avgCostBasis = totalGrams ? totalSpent / totalGrams : 0;

  return (
    <div className="space-y-8">
      <PageViewTracker routeType="portfolio" countrySlug="qatar" />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Portfolio tracker</p>
        <h1 className="font-display text-4xl font-semibold text-white">Track cost basis and unrealized performance</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total grams" value={totalGrams.toFixed(2)} />
        <MetricCard label="Total spent" value={formatQar(totalSpent)} />
        <MetricCard label="Average cost basis" value={formatQar(avgCostBasis)} />
        <MetricCard label="Unrealized P/L" value={formatQar(profitLoss)} />
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/45">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Karat</th>
                  <th className="pb-3 pr-4">Grams</th>
                  <th className="pb-3 pr-4">Paid</th>
                  <th className="pb-3 pr-4">Current</th>
                  <th className="pb-3">P/L</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  const currentPrice = latestByKarat.get(purchase.karatLabel) ?? decimalToNumber(purchase.pricePerGram);
                  const currentTotal = currentPrice * decimalToNumber(purchase.grams);
                  const delta = currentTotal - decimalToNumber(purchase.totalPaid);
                  return (
                    <tr key={purchase.id} className="border-b border-white/5">
                      <td className="py-4 pr-4">{purchase.purchasedAt.toISOString().slice(0, 10)}</td>
                      <td className="py-4 pr-4">{purchase.karatLabel}</td>
                      <td className="py-4 pr-4">{decimalToNumber(purchase.grams).toFixed(2)}</td>
                      <td className="py-4 pr-4">{formatQar(decimalToNumber(purchase.totalPaid))}</td>
                      <td className="py-4 pr-4">{formatQar(currentTotal)}</td>
                      <td className="py-4">{formatQar(delta)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <PurchaseForm />
      </section>
    </div>
  );
}

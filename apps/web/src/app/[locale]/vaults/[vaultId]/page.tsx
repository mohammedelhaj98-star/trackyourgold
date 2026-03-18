import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../../lib/api";
import { currency, formatDate } from "../../../../lib/format";
import { requireUser } from "../../../../lib/auth";
import { isLocale } from "../../../../lib/i18n";

export default async function VaultDetailPage({
  params
}: {
  params: Promise<{ locale: string; vaultId: string }>;
}) {
  const { locale, vaultId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const [vault, items, valuation] = await Promise.all([
    readJson<{ vault: { id: string; name: string } }>(await apiFetch(`/v1/vaults/${vaultId}`)),
    readJson<{ items: Array<{ id: string; itemName: string; purityKarat: number; netGoldWeightG: number; purchaseTotalPriceQar: number }> }>(
      await apiFetch(`/v1/vaults/${vaultId}/items`)
    ),
    readJson<{ asOf: string; totals: { totalValueQar: number; totalPlQar: number } }>(
      await apiFetch(`/v1/vaults/${vaultId}/valuation?mode=intrinsic`)
    )
  ]);

  return (
    <div className="stack">
      <section className="content-card stack">
        <p className="eyebrow">{vault.vault.name}</p>
        <h1>{currency(valuation.totals.totalValueQar)}</h1>
        <p className={valuation.totals.totalPlQar >= 0 ? "status-good" : "status-bad"}>
          {currency(valuation.totals.totalPlQar)} · {formatDate(valuation.asOf)}
        </p>
        <Link className="button" href={`/${locale}/items/new?vaultId=${vaultId}`}>
          Add item
        </Link>
      </section>

      <section className="list">
        {items.items.map((item) => (
          <Link key={item.id} href={`/${locale}/items/${item.id}`} className="item-card">
            <strong>{item.itemName}</strong>
            <span className="muted">{item.purityKarat}K · {item.netGoldWeightG}g</span>
            <span>{currency(item.purchaseTotalPriceQar)}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

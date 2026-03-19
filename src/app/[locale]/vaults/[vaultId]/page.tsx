import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../../lib/api";
import { requireUser } from "../../../../lib/auth";
import { currency, formatDate } from "../../../../lib/format";
import { isLocale, messages } from "../../../../lib/i18n";

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
  const copy = messages[locale];
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
    <div className="stack stack--page">
      <section className="section-banner">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{vault.vault.name}</p>
            <h1 className="section-title">{currency(valuation.totals.totalValueQar, locale)}</h1>
          </div>
          <span className="panel-chip">{items.items.length} items</span>
        </div>
        <p className={valuation.totals.totalPlQar >= 0 ? "status-good" : "status-bad"}>
          {currency(valuation.totals.totalPlQar, locale)} · {formatDate(valuation.asOf, locale)}
        </p>
        <div className="button-row">
          <Link className="button" href={`/${locale}/items/new?vaultId=${vaultId}`}>
            {copy.addItem}
          </Link>
        </div>
      </section>

      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.trackedPieces}</p>
            <h2 className="panel-title">{copy.trackedPieces}</h2>
          </div>
        </div>
        <div className="list list--rows">
          {items.items.map((item) => (
            <Link key={item.id} href={`/${locale}/items/${item.id}`} className="item-card item-card--row">
              <div className="row-main">
                <strong>{item.itemName}</strong>
                <span className="muted">
                  {item.purityKarat}K · {item.netGoldWeightG}g
                </span>
              </div>
              <div className="row-end">
                <span>{currency(item.purchaseTotalPriceQar, locale)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

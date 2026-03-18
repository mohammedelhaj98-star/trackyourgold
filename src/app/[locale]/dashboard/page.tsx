import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../lib/api";
import { currency, formatDate } from "../../../lib/format";
import { requireUser } from "../../../lib/auth";
import { isLocale, messages } from "../../../lib/i18n";

type VaultsPayload = {
  vaults: Array<{ id: string; name: string; defaultCurrency: string }>;
};

type ValuationPayload = {
  asOf: string;
  totals: {
    totalValueQar: number;
    totalCostQar: number;
    totalPlQar: number;
  };
  items: Array<{
    itemId: string;
    itemName: string;
    karat: number;
    netWeightG: number;
    valueQar: number;
    plQar: number;
  }>;
};

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const me = await requireUser(locale);
  const copy = messages[locale];
  const vaults = await readJson<VaultsPayload>(await apiFetch("/v1/vaults"));
  const defaultVaultId = me.defaultVaultId ?? vaults.vaults[0]?.id;
  const valuation = defaultVaultId
    ? await readJson<ValuationPayload>(await apiFetch(`/v1/vaults/${defaultVaultId}/valuation?mode=intrinsic`))
    : null;

  return (
    <div className="stack">
      <section className="metric-grid">
        <article className="metric-card stack">
          <span className="muted">{copy.totalValue}</span>
          <h2 className="metric-value">{currency(valuation?.totals.totalValueQar ?? 0)}</h2>
        </article>
        <article className="metric-card stack">
          <span className="muted">{copy.invested}</span>
          <h2 className="metric-value">{currency(valuation?.totals.totalCostQar ?? 0)}</h2>
        </article>
        <article className="metric-card stack">
          <span className="muted">{copy.profitLoss}</span>
          <h2 className={`metric-value ${(valuation?.totals.totalPlQar ?? 0) >= 0 ? "status-good" : "status-bad"}`}>
            {currency(valuation?.totals.totalPlQar ?? 0)}
          </h2>
          <span className="muted">{copy.lastUpdated}: {valuation ? formatDate(valuation.asOf) : "Pending"}</span>
        </article>
      </section>

      <section className="content-card stack">
        <div className="button-row">
          <Link className="button" href={`/${locale}/items/new?vaultId=${defaultVaultId ?? ""}`}>
            Add item
          </Link>
          <Link className="button button--ghost" href={`/${locale}/vaults`}>
            Manage vaults
          </Link>
        </div>
        <div className="list">
          {valuation?.items.map((item) => (
            <Link key={item.itemId} href={`/${locale}/items/${item.itemId}`} className="item-card">
              <strong>{item.itemName}</strong>
              <span className="muted">{item.karat}K · {item.netWeightG}g</span>
              <span>{currency(item.valueQar)}</span>
              <span className={item.plQar >= 0 ? "status-good" : "status-bad"}>{currency(item.plQar)}</span>
            </Link>
          )) ?? <div className="notice">Add your first piece to start tracking daily value.</div>}
        </div>
      </section>
    </div>
  );
}

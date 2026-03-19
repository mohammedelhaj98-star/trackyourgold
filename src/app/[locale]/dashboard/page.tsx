import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../lib/api";
import { requireUser } from "../../../lib/auth";
import { currency, formatDate } from "../../../lib/format";
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
    <div className="stack stack--page">
      <section className="section-banner">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.dashboardTitle}</p>
            <h1 className="section-title">{copy.dashboardTitle}</h1>
          </div>
          <span className="panel-chip">{vaults.vaults.length} vaults</span>
        </div>
        <p className="muted">{copy.dashboardIntro}</p>
        <div className="button-row">
          <Link className="button" href={`/${locale}/items/new?vaultId=${defaultVaultId ?? ""}`}>
            {copy.addItem}
          </Link>
          <Link className="button button--ghost" href={`/${locale}/vaults`}>
            {copy.manageVaults}
          </Link>
        </div>
      </section>

      <section className="metric-grid metric-grid--dashboard">
        <article className="metric-card metric-card--spotlight stack">
          <span className="muted">{copy.totalValue}</span>
          <h2 className="metric-value">{currency(valuation?.totals.totalValueQar ?? 0, locale)}</h2>
        </article>
        <article className="metric-card stack">
          <span className="muted">{copy.invested}</span>
          <h2 className="metric-value">{currency(valuation?.totals.totalCostQar ?? 0, locale)}</h2>
        </article>
        <article className="metric-card stack">
          <span className="muted">{copy.profitLoss}</span>
          <h2 className={`metric-value ${(valuation?.totals.totalPlQar ?? 0) >= 0 ? "status-good" : "status-bad"}`}>
            {currency(valuation?.totals.totalPlQar ?? 0, locale)}
          </h2>
          <span className="muted">
            {copy.lastUpdated}: {valuation ? formatDate(valuation.asOf, locale) : copy.pending}
          </span>
        </article>
      </section>

      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.trackedPieces}</p>
            <h2 className="panel-title">{copy.trackedPieces}</h2>
          </div>
          <span className="panel-chip">{valuation?.items.length ?? 0}</span>
        </div>

        <div className="list list--rows">
          {valuation?.items.length ? (
            valuation.items.map((item) => (
              <Link key={item.itemId} href={`/${locale}/items/${item.itemId}`} className="item-card item-card--row">
                <div className="row-main">
                  <strong>{item.itemName}</strong>
                  <span className="muted">
                    {item.karat}K · {item.netWeightG}g
                  </span>
                </div>
                <div className="row-end">
                  <span>{currency(item.valueQar, locale)}</span>
                  <span className={item.plQar >= 0 ? "status-good" : "status-bad"}>
                    {currency(item.plQar, locale)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="notice">{copy.emptyItems}</div>
          )}
        </div>
      </section>
    </div>
  );
}

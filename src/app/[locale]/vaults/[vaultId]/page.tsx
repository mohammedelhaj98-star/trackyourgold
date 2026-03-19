import Link from "next/link";
import { notFound } from "next/navigation";

import { RangeTabs } from "../../../../components/range-tabs";
import { ValueChart } from "../../../../components/value-chart";
import { apiFetch, readJson } from "../../../../lib/api";
import { requireUser } from "../../../../lib/auth";
import { currency, formatDate, formatNumber, formatSignedCurrency } from "../../../../lib/format";
import { isLocale, messages } from "../../../../lib/i18n";
import {
  aggregatePortfolioHistory,
  coerceRangeDays,
  fetchLatestRates,
  fetchQuoteHistory,
  fetchVaultItems,
  normalizeHolding,
  summarizePortfolio,
  type ApiVault
} from "../../../../lib/portfolio";
import { getUiPreferences } from "../../../../lib/preferences";

export default async function VaultDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; vaultId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale, vaultId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const copy = messages[locale];
  const preferences = await getUiPreferences();
  const rangeDays = coerceRangeDays((await searchParams).range);

  const [vaultPayload, items, marketRates, history] = await Promise.all([
    readJson<{ vault: ApiVault }>(await apiFetch(`/v1/vaults/${vaultId}`)),
    fetchVaultItems(vaultId),
    fetchLatestRates("market"),
    fetchQuoteHistory(rangeDays, "market")
  ]);

  const holdings = items.map((item) => normalizeHolding(item, vaultPayload.vault, marketRates));
  const summary = summarizePortfolio(holdings, marketRates);
  const chartPoints = aggregatePortfolioHistory(holdings, history);

  return (
    <div className="dashboard-grid">
      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{vaultPayload.vault.name}</p>
            <h1 className="section-title">{vaultPayload.vault.name}</h1>
          </div>
          <span className="panel-chip">{holdings.length}</span>
        </div>

        <div className="metric-grid metric-grid--compact">
          <div className="metric-card">
            <span className="muted">{copy.common.totalValue}</span>
            <strong>{currency(summary.portfolioValueQar, locale)}</strong>
          </div>
          <div className="metric-card">
            <span className="muted">{copy.common.fineGoldGrams}</span>
            <strong>{formatNumber(summary.fineGoldGrams, locale, 2)}g</strong>
          </div>
          <div className="metric-card">
            <span className="muted">{copy.common.lastUpdated}</span>
            <strong>{formatDate(summary.lastUpdated, locale)}</strong>
          </div>
        </div>

        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.home.chartPortfolio}</p>
            <h2 className="panel-title">{copy.home.chartPortfolio}</h2>
          </div>
          <RangeTabs currentDays={rangeDays} hrefForDays={(days) => `/${locale}/vaults/${vaultId}?range=${days}`} />
        </div>
        <ValueChart locale={locale} points={chartPoints} emptyLabel={copy.common.noData} />

        <div className="button-row">
          <Link className="button" href={`/${locale}/items/new?vaultId=${vaultId}`}>
            {copy.nav.addGold}
          </Link>
          <Link className="button button--ghost" href={`/${locale}/vaults`}>
            {copy.nav.portfolio}
          </Link>
        </div>
      </section>

      <aside className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.home.recentHoldings}</p>
            <h2 className="panel-title">{copy.home.recentHoldings}</h2>
          </div>
        </div>

        <div className="list list--rows">
          {holdings.map((holding) => (
            <Link key={holding.id} href={`/${locale}/items/${holding.id}`} className="item-card item-card--row">
              <div className="row-main">
                <strong>{holding.name}</strong>
                <span className="muted">
                  {holding.karat}K · {formatNumber(holding.grams, locale, 2)}g
                </span>
              </div>
              <div className="row-end">
                <span>{currency(holding.worthNowQar, locale)}</span>
                {preferences.showGainLossWhenBasisExists && holding.gainLossQar !== null ? (
                  <span className={holding.gainLossQar >= 0 ? "status-good" : "status-bad"}>
                    {formatSignedCurrency(holding.gainLossQar, locale)}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

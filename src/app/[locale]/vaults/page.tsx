import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "../../../components/ad-slot";
import { createVaultAction } from "../../../lib/actions";
import { requireUser } from "../../../lib/auth";
import { currency, formatNumber, formatSignedCurrency } from "../../../lib/format";
import { isLocale } from "../../../lib/i18n";
import { filterAndSortHoldings, loadPortfolioState } from "../../../lib/portfolio";
import { getUiPreferences } from "../../../lib/preferences";
import { getRuntimeUi } from "../../../lib/ui-config";

export default async function PortfolioPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; karat?: string; tag?: string; sort?: string; deleted?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const [preferences, ui] = await Promise.all([getUiPreferences(), getRuntimeUi(locale)]);
  const copy = ui.copy;
  const [{ holdings, summary, vaults }, query] = await Promise.all([loadPortfolioState(), searchParams]);

  const allTags = [...new Set(holdings.flatMap((holding) => holding.tags))].sort((left, right) => left.localeCompare(right));
  const filtered = filterAndSortHoldings(holdings, {
    search: query.q,
    karat: query.karat ? Number(query.karat) : null,
    tag: query.tag ?? null,
    sort:
      query.sort === "highest-value" || query.sort === "best-gain" || query.sort === "most-grams"
        ? query.sort
        : "newest"
  });
  const strongestHolding = [...holdings].sort((left, right) => right.worthNowQar - left.worthNowQar)[0] ?? null;

  return (
    <div className="dashboard-grid">
      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.portfolio.title}</p>
            <h1 className="section-title">{copy.portfolio.title}</h1>
          </div>
          <span className="panel-chip">{summary.holdingsCount}</span>
        </div>
        <p className="muted">{copy.portfolio.intro}</p>

        {query.deleted === "1" ? (
          <div className="notice notice--success">
            <strong>{copy.holding.deletePrompt}</strong>
            <span>{copy.holding.deleteWarning}</span>
          </div>
        ) : null}

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
            <span className="muted">{copy.portfolio.totalHoldings}</span>
            <strong>{summary.holdingsCount}</strong>
          </div>
        </div>

        <form className="filters-bar" method="GET">
          <div className="field">
            <label htmlFor="q">{copy.portfolio.searchLabel}</label>
            <input id="q" name="q" defaultValue={query.q ?? ""} placeholder={copy.portfolio.searchPlaceholder} />
          </div>
          <div className="field">
            <label htmlFor="karat">{copy.portfolio.filterKarat}</label>
            <select id="karat" name="karat" defaultValue={query.karat ?? ""}>
              <option value="">{copy.portfolio.allKarats}</option>
              {[24, 23, 22, 21, 18, 14, 12, 10, 9, 8].map((value) => (
                <option key={value} value={value}>
                  {value}K
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tag">{copy.portfolio.filterTag}</label>
            <select id="tag" name="tag" defaultValue={query.tag ?? ""}>
              <option value="">{copy.portfolio.allTags}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {copy.tags[tag as keyof typeof copy.tags] ?? tag}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">{copy.portfolio.sortBy}</label>
            <select id="sort" name="sort" defaultValue={query.sort ?? "newest"}>
              <option value="newest">{copy.portfolio.sortNewest}</option>
              <option value="highest-value">{copy.portfolio.sortHighestValue}</option>
              <option value="best-gain">{copy.portfolio.sortBestGain}</option>
              <option value="most-grams">{copy.portfolio.sortMostGrams}</option>
            </select>
          </div>
          <button type="submit" className="button button--ghost button--compact">
            {copy.portfolio.filterSummary}
          </button>
        </form>

        <div className="list list--rows">
          {filtered.length ? (
            filtered.flatMap((holding, index) => {
              const items = [
                <Link key={holding.id} href={`/${locale}/items/${holding.id}`} className="item-card item-card--row">
                  <div className="row-main">
                    <strong>{holding.name}</strong>
                    <span className="muted">
                      {holding.karat}K · {formatNumber(holding.grams, locale, 2)}g · {holding.vaultName}
                    </span>
                    {holding.tags.length ? (
                      <div className="row-tags">
                        {holding.tags.map((tag) => (
                          <span key={tag} className="panel-chip panel-chip--muted">
                            {copy.tags[tag as keyof typeof copy.tags] ?? tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
              ];

              if (ui.ads.portfolio.enabled && (index + 1) % 9 === 0 && index !== filtered.length - 1) {
                items.push(
                  <AdSlot
                    key={`ad-${holding.id}`}
                    label={ui.ads.label}
                    title={ui.ads.portfolio.title}
                    copy={ui.ads.portfolio.copy}
                  />
                );
              }

              return items;
            })
          ) : (
            <div className="notice">
              <strong>{copy.portfolio.noHoldingsTitle}</strong>
              <span>{copy.portfolio.noHoldingsCopy}</span>
              <div className="button-row">
                <Link className="button" href={`/${locale}/items/new?vaultId=${vaults[0]?.id ?? ""}`}>
                  {copy.nav.addGold}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="stack">
        <section className="form-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.portfolio.vaultsCardTitle}</p>
              <h2 className="panel-title">{copy.portfolio.vaultsCardTitle}</h2>
            </div>
            <span className="panel-chip">{vaults.length}</span>
          </div>

          <div className="list list--rows">
            {vaults.map((vault) => (
              <Link key={vault.id} href={`/${locale}/vaults/${vault.id}`} className="item-card item-card--row">
                <div className="row-main">
                  <strong>{vault.name}</strong>
                </div>
              </Link>
            ))}
          </div>

          <form className="form" action={createVaultAction}>
            <input type="hidden" name="locale" value={locale} />
            <div className="field">
              <label htmlFor="name">{copy.portfolio.vaultName}</label>
              <input id="name" name="name" required />
            </div>
            <button type="submit">{copy.portfolio.createVault}</button>
          </form>
        </section>

        {strongestHolding ? (
          <section className="content-card stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.portfolio.strongestHolding}</p>
                <h2 className="panel-title">{strongestHolding.name}</h2>
              </div>
            </div>
            <p className="muted">
              {strongestHolding.karat}K · {formatNumber(strongestHolding.grams, locale, 2)}g
            </p>
            <div className="metric-card">
              <span className="muted">{copy.common.worthNow}</span>
              <strong>{currency(strongestHolding.worthNowQar, locale)}</strong>
            </div>
            <Link className="button button--ghost" href={`/${locale}/items/${strongestHolding.id}`}>
              {copy.holding.title}
            </Link>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

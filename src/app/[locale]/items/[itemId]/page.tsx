import { notFound } from "next/navigation";

import { HoldingForm } from "../../../../components/holding-form";
import { RangeTabs } from "../../../../components/range-tabs";
import { ValueChart } from "../../../../components/value-chart";
import { deleteItemAction, updateItemAction } from "../../../../lib/actions";
import { requireUser } from "../../../../lib/auth";
import { currency, formatDate, formatNumber, formatSignedCurrency } from "../../../../lib/format";
import { isLocale, messages } from "../../../../lib/i18n";
import {
  buildHoldingHistory,
  coerceRangeDays,
  fetchQuoteHistory,
  loadPortfolioState,
  parseHoldingNotes
} from "../../../../lib/portfolio";
import { getUiPreferences } from "../../../../lib/preferences";

export default async function ItemDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; itemId: string }>;
  searchParams: Promise<{ range?: string; saved?: string }>;
}) {
  const { locale, itemId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const copy = messages[locale];
  const preferences = await getUiPreferences();
  const { range, saved } = await searchParams;
  const rangeDays = coerceRangeDays(range);
  const [{ holdings, summary, marketRates }, history] = await Promise.all([loadPortfolioState(), fetchQuoteHistory(rangeDays)]);

  const holding = holdings.find((item) => item.id === itemId);
  if (!holding) {
    notFound();
  }

  const notesMeta = parseHoldingNotes(holding.rawItem.purchaseNotes);
  const chartPoints = buildHoldingHistory(holding, history);
  const boundUpdate = updateItemAction.bind(null, itemId, locale);
  const boundDelete = deleteItemAction.bind(null, itemId, locale);

  return (
    <div className="stack stack--page">
      {saved === "1" ? (
        <div className="notice notice--success">
          <strong>{copy.settings.preferencesSaved}</strong>
        </div>
      ) : null}

      <section className="dashboard-grid">
        <article className="hero-surface hero-surface--primary stack">
          <div className="hero-heading">
            <div>
              <p className="eyebrow">{copy.holding.title}</p>
              <h1 className="hero-title">{holding.name}</h1>
            </div>
            <span className={`status-pill ${marketRates.stale ? "status-pill--soft" : "status-pill--live"}`}>
              {marketRates.stale ? copy.common.staleData : copy.common.freshData}
            </span>
          </div>

          <div className="hero-stat-strip">
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.worthNow}</span>
              <strong>{currency(holding.worthNowQar, locale)}</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.gainLoss}</span>
              <strong>
                {preferences.showGainLossWhenBasisExists && holding.gainLossQar !== null
                  ? formatSignedCurrency(holding.gainLossQar, locale)
                  : copy.common.pending}
              </strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.lastUpdated}</span>
              <strong>{formatDate(summary.lastUpdated, locale)}</strong>
            </div>
          </div>

          <div className="notice">
            <strong>{copy.holding.weightAndKarat}</strong>
            <span>
              {holding.karat}K · {formatNumber(holding.grams, locale, 2)}g · {formatNumber(holding.fineGoldGrams, locale, 2)}g
            </span>
          </div>
        </article>

        <aside className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.holding.marketContext}</p>
              <h2 className="panel-title">{copy.holding.marketContext}</h2>
            </div>
          </div>

          <div className="metric-grid metric-grid--compact">
            <div className="metric-card">
              <span className="muted">{copy.common.live22k}</span>
              <strong>{currency(derive22k(), locale)}</strong>
            </div>
            <div className="metric-card">
              <span className="muted">{copy.common.live24k}</span>
              <strong>{currency(marketRates.pricesByKarat["24K"] ?? 0, locale)}</strong>
            </div>
            <div className="metric-card">
              <span className="muted">{copy.common.lastUpdated}</span>
              <strong>{formatDate(marketRates.asOf, locale)}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="dashboard-grid">
        <article className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.holding.chartTitle}</p>
              <h2 className="panel-title">{copy.holding.chartTitle}</h2>
            </div>
            <RangeTabs
              currentDays={rangeDays}
              hrefForDays={(days) => `/${locale}/items/${itemId}?range=${days}${saved === "1" ? "&saved=1" : ""}`}
            />
          </div>
          <ValueChart locale={locale} points={chartPoints} emptyLabel={copy.common.noData} />
        </article>

        <article className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.holding.purchaseBasis}</p>
              <h2 className="panel-title">{copy.holding.purchaseBasis}</h2>
            </div>
          </div>
          <div className="list list--rows">
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.addGold.purchaseDate}</strong>
              </div>
              <div className="row-end">
                <span>{holding.purchaseDate ? formatDate(holding.purchaseDate, locale) : copy.common.pending}</span>
              </div>
            </div>
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.common.invested}</strong>
              </div>
              <div className="row-end">
                <span>{holding.purchaseTotalQar !== null ? currency(holding.purchaseTotalQar, locale) : copy.common.pending}</span>
              </div>
            </div>
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.addGold.breakEven}</strong>
              </div>
              <div className="row-end">
                <span>{holding.breakEvenPerGramQar !== null ? currency(holding.breakEvenPerGramQar, locale) : copy.common.pending}</span>
              </div>
            </div>
            {holding.notes ? (
              <div className="notice">
                <strong>{copy.holding.notes}</strong>
                <span>{holding.notes}</span>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <HoldingForm
        locale={locale}
        copy={copy}
        submitLabel={copy.common.save}
        action={boundUpdate}
        vaultOptions={[{ id: holding.vaultId, name: holding.vaultName }]}
        allowVaultChange={false}
        live24kQar={marketRates.pricesByKarat["24K"] ?? 0}
        currentFineGoldGrams={summary.fineGoldGrams - holding.fineGoldGrams}
        values={{
          vaultId: holding.vaultId,
          itemName: holding.name,
          grams: holding.grams,
          karat: holding.karat,
          purchaseBasisEnabled: holding.purchaseBasisKnown,
          purchasePriceMode: notesMeta.purchasePriceMode,
          purchasePriceValue:
            holding.purchaseTotalQar !== null
              ? notesMeta.purchasePriceMode === "per_gram"
                ? Number((holding.purchaseTotalQar / Math.max(holding.grams, 1)).toFixed(2))
                : holding.purchaseTotalQar
              : "",
          purchaseDate: holding.purchaseDate ? holding.purchaseDate.slice(0, 10) : "",
          tags: holding.tags,
          notes: holding.notes
        }}
      />

      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.holding.deletePrompt}</p>
            <h2 className="panel-title">{copy.holding.deletePrompt}</h2>
          </div>
        </div>
        <p className="muted">{copy.holding.deleteWarning}</p>
        <form action={boundDelete}>
          <button type="submit" className="button button--ghost">
            {copy.common.delete}
          </button>
        </form>
      </section>
    </div>
  );

  function derive22k() {
    const price24k = marketRates.pricesByKarat["24K"] ?? 0;
    return marketRates.pricesByKarat["22K"] ?? Number((price24k * (22 / 24)).toFixed(2));
  }
}

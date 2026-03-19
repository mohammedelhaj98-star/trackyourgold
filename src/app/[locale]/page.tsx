import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "../../components/ad-slot";
import { CountUp } from "../../components/count-up";
import { RangeTabs } from "../../components/range-tabs";
import { ValueChart } from "../../components/value-chart";
import { getCurrentUser } from "../../lib/auth";
import { currency, formatDate, formatNumber, formatSignedCurrency, formatSignedPercent } from "../../lib/format";
import { getAchievementLabel, getTierLabel, isLocale } from "../../lib/i18n";
import {
  aggregatePortfolioHistory,
  coerceRangeDays,
  computeAchievements,
  computeTierProgress,
  fetchPublicHome,
  fetchQuoteHistory,
  getLatestUnlockedAchievement,
  loadPortfolioState,
  type ChartPoint
} from "../../lib/portfolio";
import { getUiPreferences } from "../../lib/preferences";
import { getRuntimeUi } from "../../lib/ui-config";

export default async function HomePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string; added?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const { range, added } = await searchParams;
  const rangeDays = coerceRangeDays(range);
  const [me, preferences, publicHome, ui] = await Promise.all([
    getCurrentUser(),
    getUiPreferences(),
    fetchPublicHome(),
    getRuntimeUi(locale)
  ]);
  const copy = ui.copy;

  if (!me) {
    const history = await fetchQuoteHistory(30, "market");
    const points: ChartPoint[] = history.map((point) => ({
      asOf: point.asOf,
      totalValueQar: point.price22k
    }));

    return (
      <div className="stack stack--page">
        <section className="hero-stage">
          <article className="hero-surface hero-surface--primary stack">
            <div className="hero-heading">
              <div>
                <p className="eyebrow">{copy.hero.eyebrow}</p>
                <h1 className="hero-title">{copy.hero.title}</h1>
              </div>
              <span className={`status-pill ${publicHome.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
                {publicHome.marketStale ? copy.hero.signalStale : copy.hero.signalFresh}
              </span>
            </div>

            <div className="price-block">
              <p className="price-kicker">{copy.hero.rateLabel}</p>
              <h2 className="price-value">{currency(publicHome.latestPrice22k, locale)}</h2>
              <p className="hero-copy">{copy.hero.subtitle}</p>
            </div>

            <div className="hero-stat-strip">
              <div className="hero-stat">
                <span className="hero-stat-label">{copy.common.live24k}</span>
                <strong>{currency(publicHome.latestPrice24k, locale)}</strong>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">{copy.common.retail22k}</span>
                <strong>{publicHome.retail ? currency(publicHome.retail.latestPrice22k, locale) : copy.common.pending}</strong>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">{copy.common.lastUpdated}</span>
                <strong>{formatDate(publicHome.marketAsOf, locale)}</strong>
              </div>
            </div>

            <div className="cta-row">
              <Link className="button" href={`/${locale}/signup`}>
                {copy.hero.primaryCta}
              </Link>
              <Link className="button button--ghost" href={`/${locale}/login`}>
                {copy.nav.login}
              </Link>
            </div>
          </article>

          <aside className="hero-surface hero-surface--secondary stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.hero.pulseTitle}</p>
                <h2 className="panel-title">{copy.hero.pulseTitle}</h2>
              </div>
            </div>
            <p className="muted">{copy.hero.pulseCopy}</p>
            <ValueChart locale={locale} points={points} emptyLabel={copy.common.noData} />
          </aside>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <p className="eyebrow">{copy.home.title}</p>
            <h2>{copy.common.totalValue}</h2>
            <p className="muted">{copy.home.intro}</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">{copy.common.live22k}</p>
            <h2>{currency(publicHome.latestPrice22k, locale)}</h2>
            <p className="muted">{copy.hero.signalFresh}</p>
          </article>
          {ui.ads.home.enabled ? <AdSlot label={ui.ads.label} title={ui.ads.home.title} copy={ui.ads.home.copy} /> : null}
        </section>
      </div>
    );
  }

  const [{ holdings, summary, marketRates, vaults }, history] = await Promise.all([
    loadPortfolioState(),
    fetchQuoteHistory(rangeDays, "market")
  ]);

  const progress = computeTierProgress(summary.fineGoldGrams);
  const achievements = computeAchievements(holdings);
  const newestAchievement = getLatestUnlockedAchievement(achievements);
  const chartPoints = holdings.length
    ? aggregatePortfolioHistory(holdings, history)
    : history.map((point) => ({ asOf: point.asOf, totalValueQar: point.price22k }));
  const recentHoldings = [...holdings].sort(
    (left, right) =>
      new Date(right.rawItem.createdAt ?? 0).getTime() - new Date(left.rawItem.createdAt ?? 0).getTime()
  );
  const primaryVaultId = me.defaultVaultId ?? vaults[0]?.id ?? "";

  return (
    <div className="stack stack--page">
      <section className="dashboard-hero">
        <article className="hero-surface hero-surface--primary stack">
          <div className="hero-heading">
            <div>
              <p className="eyebrow">{copy.home.title}</p>
              <h1 className="hero-title">{copy.home.title}</h1>
            </div>
            <span className={`status-pill ${marketRates.stale ? "status-pill--soft" : "status-pill--live"}`}>
              {marketRates.stale ? copy.common.staleData : copy.common.freshData}
            </span>
          </div>

          <div className="price-block">
            <span className="price-kicker">{copy.common.totalValue}</span>
            <h2 className="price-value">
              <CountUp value={summary.portfolioValueQar} locale={locale} reduceMotion={preferences.reduceMotion} />
            </h2>
            <div className="hero-performance">
              <span className={summary.profitLossQar !== null && summary.profitLossQar >= 0 ? "status-good" : "status-bad"}>
                {summary.profitLossQar !== null ? formatSignedCurrency(summary.profitLossQar, locale) : copy.common.pending}
              </span>
              <span className="muted">
                {summary.profitLossPct !== null ? formatSignedPercent(summary.profitLossPct / 100, locale) : copy.common.pending}
              </span>
            </div>
          </div>

          <div className="hero-stat-strip">
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.fineGoldGrams}</span>
              <strong>{formatNumber(summary.fineGoldGrams, locale, 2)}g</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.invested}</span>
              <strong>{currency(summary.investedQar, locale)}</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.live22k}</span>
              <strong>{currency(summary.live22kQar, locale)}</strong>
            </div>
          </div>

          <div className="cta-row">
            <Link className="button" href={`/${locale}/items/new?vaultId=${primaryVaultId}`}>
              {copy.nav.addGold}
            </Link>
            <Link className="button button--ghost" href={`/${locale}/vaults`}>
              {copy.home.viewPortfolio}
            </Link>
          </div>

          <div className="notice notice--inline">
            <strong>{copy.common.lastUpdated}</strong>
            <span>{formatDate(summary.lastUpdated, locale)}</span>
          </div>
        </article>

        <aside className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.progress.title}</p>
              <h2 className="panel-title">{getTierLabel(copy, progress.currentTier)}</h2>
            </div>
            <span className="panel-chip">{progress.tierProgressPct}%</span>
          </div>

          <p className="muted">{copy.progress.intro}</p>
          <div className="progress-preview">
            <div className="progress-preview__header">
              <strong>{copy.home.progressToNextTier}</strong>
              <span>
                {progress.nextTier ? `${formatNumber(progress.gramsToNextTier, locale, 2)}g` : copy.progress.legacy}
              </span>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${progress.tierProgressPct}%` }} />
            </div>
          </div>

          <div className="list list--rows">
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.home.holdingsCount}</strong>
              </div>
              <div className="row-end">
                <span>{summary.holdingsCount}</span>
              </div>
            </div>
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.home.newestAchievement}</strong>
              </div>
              <div className="row-end">
                <span>{newestAchievement ? getAchievementLabel(copy, newestAchievement.key) : copy.common.pending}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {added === "1" ? (
        <div className="notice notice--success">
          <strong>{copy.addGold.addedToVault}</strong>
          {newestAchievement ? (
            <span>
              {copy.achievements.unlocked}: {getAchievementLabel(copy, newestAchievement.key)}
            </span>
          ) : null}
        </div>
      ) : null}

      <section className="dashboard-grid dashboard-grid--cards">
        {ui.homeSections.map((section) => {
          if (section === "chart") {
            return (
              <article key={section} className="content-card stack">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{holdings.length ? copy.home.chartPortfolio : copy.home.chartMarket}</p>
                    <h2 className="panel-title">{holdings.length ? copy.home.chartPortfolio : copy.home.chartMarket}</h2>
                  </div>
                  <RangeTabs
                    currentDays={rangeDays}
                    hrefForDays={(days) => `/${locale}?range=${days}${added === "1" ? "&added=1" : ""}`}
                  />
                </div>
                <ValueChart locale={locale} points={chartPoints} emptyLabel={copy.common.noData} />
                {!holdings.length ? (
                  <div className="notice">
                    <strong>{copy.home.emptyTitle}</strong>
                    <span>{copy.home.emptyCopy}</span>
                    <div className="button-row">
                      <Link className="button" href={`/${locale}/items/new?vaultId=${primaryVaultId}`}>
                        {copy.nav.addGold}
                      </Link>
                      <a className="button button--ghost" href="#market-strip">
                        {copy.home.viewLiveMarket}
                      </a>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          }

          if (section === "market") {
            return (
              <article key={section} className="content-card stack" id="market-strip">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{copy.home.marketStripTitle}</p>
                    <h2 className="panel-title">{copy.home.marketStripTitle}</h2>
                  </div>
                  <span className={`status-pill ${publicHome.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
                    {publicHome.marketStale ? copy.common.staleData : copy.common.freshData}
                  </span>
                </div>

                <div className="metric-grid metric-grid--compact">
                  <div className="metric-card">
                    <span className="muted">{copy.common.live22k}</span>
                    <strong>{currency(publicHome.latestPrice22k, locale)}</strong>
                  </div>
                  <div className="metric-card">
                    <span className="muted">{copy.common.live24k}</span>
                    <strong>{currency(publicHome.latestPrice24k, locale)}</strong>
                  </div>
                  {preferences.showRetailComparison ? (
                    <div className="metric-card">
                      <span className="muted">{copy.common.retail22k}</span>
                      <strong>{publicHome.retail ? currency(publicHome.retail.latestPrice22k, locale) : copy.common.pending}</strong>
                    </div>
                  ) : null}
                </div>

                <div className="list list--rows">
                  <div className="item-card item-card--row">
                    <div className="row-main">
                      <strong>{copy.common.lastUpdated}</strong>
                    </div>
                    <div className="row-end">
                      <span>{formatDate(publicHome.marketAsOf, locale)}</span>
                    </div>
                  </div>
                  {publicHome.retail ? (
                    <div className="item-card item-card--row">
                      <div className="row-main">
                        <strong>{copy.common.retail22k}</strong>
                      </div>
                      <div className="row-end">
                        <span>{formatDate(publicHome.retail.asOf, locale)}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {ui.ads.home.enabled ? <AdSlot label={ui.ads.label} title={ui.ads.home.title} copy={ui.ads.home.copy} /> : null}
              </article>
            );
          }

          if (section === "recentHoldings") {
            return (
              <article key={section} className="content-card stack">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{copy.home.recentHoldings}</p>
                    <h2 className="panel-title">{copy.home.recentHoldings}</h2>
                  </div>
                  <Link className="link-pill" href={`/${locale}/vaults`}>
                    {copy.home.viewPortfolio}
                  </Link>
                </div>

                <div className="list list--rows">
                  {recentHoldings.length ? (
                    recentHoldings.slice(0, 4).map((holding) => (
                      <Link key={holding.id} href={`/${locale}/items/${holding.id}`} className="item-card item-card--row">
                        <div className="row-main">
                          <strong>{holding.name}</strong>
                          <span className="muted">
                            {holding.karat}K · {formatNumber(holding.grams, locale, 2)}g · {holding.vaultName}
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
                    ))
                  ) : (
                    <div className="notice">
                      <strong>{copy.home.emptyTitle}</strong>
                      <span>{copy.home.noRecentHoldings}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          }

          return (
            <article key={section} className="content-card stack">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.progress.achievements}</p>
                  <h2 className="panel-title">{copy.progress.achievements}</h2>
                </div>
              </div>
              <div className="achievement-grid">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.key}
                    className={`achievement-card ${achievement.unlocked ? "achievement-card--unlocked" : ""}`}
                  >
                    <strong>{getAchievementLabel(copy, achievement.key)}</strong>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

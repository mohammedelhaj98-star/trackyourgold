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
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);
  const teaserAchievements = (unlockedAchievements.length
    ? unlockedAchievements
    : achievements.filter((achievement) => !achievement.unlocked)
  ).slice(0, 3);
  const hasHoldings = holdings.length > 0;
  const chartPoints = hasHoldings
    ? aggregatePortfolioHistory(holdings, history)
    : history.map((point) => ({ asOf: point.asOf, totalValueQar: point.price22k }));
  const recentHoldings = [...holdings].sort(
    (left, right) =>
      new Date(right.rawItem.createdAt ?? 0).getTime() - new Date(left.rawItem.createdAt ?? 0).getTime()
  );
  const primaryVaultId = me.defaultVaultId ?? vaults[0]?.id ?? "";
  const showChart = ui.homeSections.includes("chart");
  const showMarket = ui.homeSections.includes("market");
  const showRecentHoldings = ui.homeSections.includes("recentHoldings");
  const showAchievements = ui.homeSections.includes("achievements");
  const addGoldHref = `/${locale}/items/new?vaultId=${primaryVaultId}`;
  const marketAnchorHref = showMarket ? "#dashboard-market" : `/${locale}?range=${rangeDays}`;
  const dashboardCopy =
    locale === "ar"
      ? {
          emptyLead: "ابدأ بقطعة ذهب واحدة ليصبح هذا المكان قراءتك اليومية الهادئة للقيمة، والذهب الصافي، والتقدم.",
          emptyChartCopy: "استخدم هذا الرسم كخط أساس حي للسوق حتى تضيف أول قطعة إلى خزنتك.",
          marketSupport: "قراءة سريعة لأسعار السوق والتجزئة في قطر، تبقى داعمة لمحفظتك وليست بديلاً عنها.",
          progressSupport: "كل غرام صافٍ يقربك من المرحلة التالية. لا يلزم أن تكون البداية كبيرة حتى تكون مشجعة.",
          noBasis: "أضف سعر الشراء لاحقاً لتفعيل الربح والخسارة عندما تكون جاهزاً.",
          teaserSupport: "تظهر الإنجازات والمقتنيات الحديثة هنا بشكل أخف مع نمو خزنتك.",
          primaryCtaHint: "أضف أول قطعة ذهب",
          marketSnapshot: "لقطة سوق سريعة"
        }
      : {
          emptyLead: "Start with one gold piece and this dashboard becomes your calm daily read on value, fine grams, and progress.",
          emptyChartCopy: "Use this live market trend as your baseline until your first holding turns it into a personal value chart.",
          marketSupport: "A quick scan of live and retail pricing in Qatar, kept supportive rather than louder than your own vault.",
          progressSupport: "Every fine-gold gram moves you forward. Your first piece is enough to make the page feel alive.",
          noBasis: "Add purchase price later to unlock profit and loss when you are ready.",
          teaserSupport: "Recent holdings and achievements stay lightweight until your vault has a story to show.",
          primaryCtaHint: "Add your first gold piece",
          marketSnapshot: "Market snapshot"
        };

  if (!hasHoldings) {
    return (
      <div className="stack stack--page">
        <section className="dashboard-state dashboard-state--empty">
          <article className="hero-surface hero-surface--primary dashboard-summary-card stack">
            <div className="hero-heading">
              <div>
                <p className="eyebrow">{copy.home.title}</p>
                <h1 className="hero-title">{copy.home.emptyTitle}</h1>
              </div>
              <span className={`status-pill ${publicHome.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
                {publicHome.marketStale ? copy.common.staleData : copy.common.freshData}
              </span>
            </div>

            <div className="dashboard-summary">
              <div className="price-block">
                <span className="price-kicker">{dashboardCopy.primaryCtaHint}</span>
                <h2 className="price-value">{currency(publicHome.latestPrice22k, locale)}</h2>
                <p className="hero-copy">{dashboardCopy.emptyLead}</p>
              </div>

              <div className="dashboard-guidance-grid">
                <div className="hero-stat hero-stat--guide">
                  <span className="hero-stat-label">{copy.common.totalValue}</span>
                  <strong>{copy.home.title}</strong>
                  <p className="muted">{copy.home.intro}</p>
                </div>
                <div className="hero-stat hero-stat--guide">
                  <span className="hero-stat-label">{copy.common.fineGoldGrams}</span>
                  <strong>{getTierLabel(copy, progress.currentTier)}</strong>
                  <p className="muted">{copy.progress.emptyCopy}</p>
                </div>
                <div className="hero-stat hero-stat--guide">
                  <span className="hero-stat-label">{copy.common.live22k}</span>
                  <strong>{currency(publicHome.latestPrice22k, locale)}</strong>
                  <p className="muted">{dashboardCopy.marketSupport}</p>
                </div>
              </div>
            </div>

            <div className="cta-row">
              <Link className="button" href={addGoldHref}>
                {copy.nav.addGold}
              </Link>
              <a className="button button--ghost" href={marketAnchorHref}>
                {copy.home.viewLiveMarket}
              </a>
            </div>
          </article>

          <aside className="content-card dashboard-side-stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.progress.title}</p>
                <h2 className="panel-title">{getTierLabel(copy, progress.currentTier)}</h2>
              </div>
              <span className="panel-chip">{progress.tierProgressPct}%</span>
            </div>

            <p className="muted">{dashboardCopy.progressSupport}</p>

            <div className="progress-preview progress-preview--feature">
              <div className="progress-preview__header">
                <strong>{copy.home.progressToNextTier}</strong>
                <span>{formatNumber(progress.gramsToNextTier, locale, 2)}g</span>
              </div>
              <div className="progress-bar progress-bar--hero">
                <span style={{ width: `${Math.max(progress.tierProgressPct, 8)}%` }} />
              </div>
            </div>

            {showAchievements ? (
              <div className="dashboard-achievement-teaser">
                <span className="dashboard-teaser-label">{copy.progress.achievements}</span>
                <div className="dashboard-achievement-row">
                  {teaserAchievements.map((achievement) => (
                    <span key={achievement.key} className="panel-chip panel-chip--muted">
                      {getAchievementLabel(copy, achievement.key)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        <section className="dashboard-modules dashboard-modules--empty">
          {showChart ? (
            <article className="content-card stack dashboard-module dashboard-module--chart">
              <div className="section-heading section-heading--stacked">
                <div>
                  <p className="eyebrow">{copy.home.chartMarket}</p>
                  <h2 className="panel-title">{copy.home.chartMarket}</h2>
                </div>
                <RangeTabs
                  currentDays={rangeDays}
                  hrefForDays={(days) => `/${locale}?range=${days}${added === "1" ? "&added=1" : ""}`}
                />
              </div>
              <p className="muted">{dashboardCopy.emptyChartCopy}</p>
              <ValueChart locale={locale} points={chartPoints} emptyLabel={copy.common.noData} />
            </article>
          ) : null}

          {showMarket ? (
            <article className="content-card stack dashboard-module dashboard-module--support" id="dashboard-market">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{dashboardCopy.marketSnapshot}</p>
                  <h2 className="panel-title">{copy.home.marketStripTitle}</h2>
                </div>
                <span className={`status-pill ${publicHome.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
                  {publicHome.marketStale ? copy.common.staleData : copy.common.freshData}
                </span>
              </div>

              <div className="dashboard-market-strip">
                <div className="metric-card metric-card--compact">
                  <span className="muted">{copy.common.live22k}</span>
                  <strong>{currency(publicHome.latestPrice22k, locale)}</strong>
                </div>
                <div className="metric-card metric-card--compact">
                  <span className="muted">{copy.common.live24k}</span>
                  <strong>{currency(publicHome.latestPrice24k, locale)}</strong>
                </div>
                {preferences.showRetailComparison ? (
                  <div className="metric-card metric-card--compact">
                    <span className="muted">{copy.common.retail22k}</span>
                    <strong>{publicHome.retail ? currency(publicHome.retail.latestPrice22k, locale) : copy.common.noData}</strong>
                  </div>
                ) : null}
              </div>

              <div className="dashboard-inline-meta">
                <span>{copy.common.lastUpdated}</span>
                <strong>{formatDate(publicHome.marketAsOf, locale)}</strong>
              </div>

              {ui.ads.home.enabled ? <AdSlot label={ui.ads.label} title={ui.ads.home.title} copy={ui.ads.home.copy} /> : null}
            </article>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="stack stack--page">
      <section className="dashboard-state">
        <article className="hero-surface hero-surface--primary dashboard-summary-card stack">
          <div className="hero-heading">
            <div>
              <p className="eyebrow">{copy.home.title}</p>
              <h1 className="hero-title">{copy.home.title}</h1>
            </div>
            <span className={`status-pill ${marketRates.stale ? "status-pill--soft" : "status-pill--live"}`}>
              {marketRates.stale ? copy.common.staleData : copy.common.freshData}
            </span>
          </div>

          <div className="dashboard-summary">
            <div className="price-block">
              <span className="price-kicker">{copy.common.totalValue}</span>
              <h2 className="price-value">
                <CountUp value={summary.portfolioValueQar} locale={locale} reduceMotion={preferences.reduceMotion} />
              </h2>
              <div className="dashboard-performance">
                {summary.profitLossQar !== null ? (
                  <>
                    <strong className={summary.profitLossQar >= 0 ? "status-good" : "status-bad"}>
                      {formatSignedCurrency(summary.profitLossQar, locale)}
                    </strong>
                    <span className="muted">
                      {formatSignedPercent(summary.profitLossPct ? summary.profitLossPct / 100 : 0, locale)}
                    </span>
                  </>
                ) : (
                  <p className="muted">{dashboardCopy.noBasis}</p>
                )}
              </div>
            </div>

            <div className="dashboard-summary-grid">
              <div className="metric-card metric-card--spotlight">
                <span className="muted">{copy.common.fineGoldGrams}</span>
                <strong>{formatNumber(summary.fineGoldGrams, locale, 2)}g</strong>
              </div>
              <div className="metric-card">
                <span className="muted">{copy.common.invested}</span>
                <strong>{currency(summary.investedQar, locale)}</strong>
              </div>
              <div className="metric-card">
                <span className="muted">{copy.common.live22k}</span>
                <strong>{currency(summary.live22kQar, locale)}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-summary-footer">
            <div className="cta-row">
              <Link className="button" href={addGoldHref}>
                {copy.nav.addGold}
              </Link>
              <Link className="button button--ghost" href={`/${locale}/vaults`}>
                {copy.home.viewPortfolio}
              </Link>
            </div>

            <div className="dashboard-inline-meta">
              <span>{copy.common.lastUpdated}</span>
              <strong>{formatDate(summary.lastUpdated, locale)}</strong>
              <span className="dashboard-inline-meta__dot" aria-hidden="true">
                •
              </span>
              <span>
                {summary.holdingsCount} {copy.home.holdingsCount.toLowerCase()}
              </span>
            </div>
          </div>
        </article>

        <aside className="dashboard-side-stack">
          <article className="content-card stack dashboard-module dashboard-module--support">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.progress.title}</p>
                <h2 className="panel-title">{getTierLabel(copy, progress.currentTier)}</h2>
              </div>
              <span className="panel-chip">{progress.tierProgressPct}%</span>
            </div>

            <p className="muted">{copy.progress.intro}</p>

            <div className="progress-preview progress-preview--feature">
              <div className="progress-preview__header">
                <strong>{copy.home.progressToNextTier}</strong>
                <span>
                  {progress.nextTier ? `${formatNumber(progress.gramsToNextTier, locale, 2)}g` : copy.progress.legacy}
                </span>
              </div>
              <div className="progress-bar progress-bar--hero">
                <span style={{ width: `${progress.tierProgressPct}%` }} />
              </div>
            </div>

            <div className="dashboard-support-stat">
              <span>{copy.home.newestAchievement}</span>
              <strong>{newestAchievement ? getAchievementLabel(copy, newestAchievement.key) : copy.progress.noAchievements}</strong>
            </div>
          </article>

          {showMarket ? (
            <article className="content-card stack dashboard-module dashboard-module--market" id="dashboard-market">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{dashboardCopy.marketSnapshot}</p>
                  <h2 className="panel-title">{copy.home.marketStripTitle}</h2>
                </div>
                <span className={`status-pill ${publicHome.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
                  {publicHome.marketStale ? copy.common.staleData : copy.common.freshData}
                </span>
              </div>

              <div className="dashboard-market-strip">
                <div className="metric-card metric-card--compact">
                  <span className="muted">{copy.common.live22k}</span>
                  <strong>{currency(publicHome.latestPrice22k, locale)}</strong>
                </div>
                <div className="metric-card metric-card--compact">
                  <span className="muted">{copy.common.live24k}</span>
                  <strong>{currency(publicHome.latestPrice24k, locale)}</strong>
                </div>
                {preferences.showRetailComparison ? (
                  <div className="metric-card metric-card--compact">
                    <span className="muted">{copy.common.retail22k}</span>
                    <strong>{publicHome.retail ? currency(publicHome.retail.latestPrice22k, locale) : copy.common.noData}</strong>
                  </div>
                ) : null}
              </div>

              <div className="dashboard-inline-meta">
                <span>{copy.common.lastUpdated}</span>
                <strong>{formatDate(publicHome.marketAsOf, locale)}</strong>
              </div>
            </article>
          ) : null}
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

      <section className="dashboard-modules">
        {showChart ? (
          <article className="content-card stack dashboard-module dashboard-module--chart">
            <div className="section-heading section-heading--stacked">
              <div>
                <p className="eyebrow">{copy.home.chartPortfolio}</p>
                <h2 className="panel-title">{copy.home.chartPortfolio}</h2>
              </div>
              <RangeTabs
                currentDays={rangeDays}
                hrefForDays={(days) => `/${locale}?range=${days}${added === "1" ? "&added=1" : ""}`}
              />
            </div>
            <ValueChart locale={locale} points={chartPoints} emptyLabel={copy.common.noData} />
          </article>
        ) : null}

        {showRecentHoldings ? (
          <article className="content-card stack dashboard-module dashboard-module--list">
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
              {recentHoldings.slice(0, 4).map((holding) => (
                <Link key={holding.id} href={`/${locale}/items/${holding.id}`} className="item-card item-card--row">
                  <div className="row-main">
                    <strong>{holding.name}</strong>
                    <span className="muted">
                      {holding.karat}K • {formatNumber(holding.grams, locale, 2)}g • {holding.vaultName}
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
          </article>
        ) : null}

        {showAchievements ? (
          <article className="content-card stack dashboard-module dashboard-module--compact">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.progress.achievements}</p>
                <h2 className="panel-title">{copy.progress.achievements}</h2>
              </div>
              <span className="panel-chip">{unlockedAchievements.length}</span>
            </div>

            <p className="muted">{dashboardCopy.teaserSupport}</p>

            <div className="dashboard-achievement-grid dashboard-achievement-grid--compact">
              {teaserAchievements.map((achievement) => (
                <div
                  key={achievement.key}
                  className={`achievement-card achievement-card--compact ${achievement.unlocked ? "achievement-card--unlocked" : ""}`}
                >
                  <strong>{getAchievementLabel(copy, achievement.key)}</strong>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {ui.ads.home.enabled ? <AdSlot label={ui.ads.label} title={ui.ads.home.title} copy={ui.ads.home.copy} /> : null}
      </section>
    </div>
  );
}

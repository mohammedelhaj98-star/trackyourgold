import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../lib/api";
import { currency, formatDate, formatPercent } from "../../lib/format";
import { isLocale, messages } from "../../lib/i18n";

type HomePayload = {
  latestPrice22k: number;
  latestPrice24k: number;
  marketAsOf: string;
  marketStale: boolean;
  retail: { latestPrice22k: number; latestPrice24k: number; asOf: string; stale: boolean } | null;
};

export default async function MarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = messages[locale];
  const home = await readJson<HomePayload>(await apiFetch("/v1/public/home"));
  const history = await readJson<{ points: Array<{ price22k: number }> }>(
    await apiFetch("/v1/public/quotes/history?days=7")
  );

  const chartPoints = history.points.slice(-7).map((point) => point.price22k);
  const safePoints = chartPoints.length > 0 ? chartPoints : [home.latestPrice22k];
  const max = Math.max(...safePoints, home.latestPrice22k, 1);
  const retailSpread = home.retail ? home.retail.latestPrice22k - home.latestPrice22k : null;
  const retailSpreadPct = retailSpread !== null ? retailSpread / home.latestPrice22k : null;

  return (
    <div className="stack stack--page">
      <section className="hero-stage">
        <article className="hero-surface hero-surface--primary stack">
          <div className="hero-heading">
            <p className="eyebrow">{copy.heroEyebrow}</p>
            <span className={`status-pill ${home.marketStale ? "status-pill--soft" : "status-pill--live"}`}>
              {home.marketStale ? copy.staleSignal : copy.freshSignal}
            </span>
          </div>

          <div className="price-block">
            <p className="price-kicker">{copy.heroBoardLabel}</p>
            <h1 className="price-value">{currency(home.latestPrice22k, locale)}</h1>
            <p className="hero-title">{copy.heroTitle}</p>
            <p className="hero-copy">{copy.heroSubtitle}</p>
          </div>

          <div className="hero-stat-strip">
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.live24k}</span>
              <strong>{currency(home.latestPrice24k, locale)}</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.retail22k}</span>
              <strong>{home.retail ? currency(home.retail.latestPrice22k, locale) : copy.pending}</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.retailSpread}</span>
              <strong>
                {retailSpread !== null && retailSpreadPct !== null
                  ? `${currency(retailSpread, locale)} · ${formatPercent(retailSpreadPct, locale)}`
                  : copy.pending}
              </strong>
            </div>
          </div>

          <div className="cta-row">
            <Link className="button" href={`/${locale}/signup`}>
              {copy.heroCta}
            </Link>
            <Link className="button button--ghost" href={`/${locale}/dashboard`}>
              {copy.heroSecondaryCta}
            </Link>
          </div>

          <div className="notice notice--inline">
            <strong>{copy.heroBoardLabel}</strong>
            <span>
              {copy.lastUpdated}: {formatDate(home.marketAsOf, locale)}.{" "}
              {home.marketStale ? copy.heroBoardStale : copy.heroBoardFresh}
            </span>
          </div>
        </article>

        <aside className="hero-surface hero-surface--secondary stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.heroPulseTitle}</p>
              <h2 className="panel-title">{copy.heroPulseTitle}</h2>
            </div>
            <span className="panel-chip">{safePoints.length} pts</span>
          </div>

          <p className="muted">{copy.heroPulseCopy}</p>

          <div className="chart-row chart-row--tall" aria-hidden="true">
            {safePoints.map((point, index) => (
              <span key={`${point}-${index}`} style={{ height: `${Math.max((point / max) * 100, 28)}%` }} />
            ))}
          </div>

          <div className="signal-list">
            <div className="signal-row">
              <span className="muted">{copy.lastUpdated}</span>
              <strong>{formatDate(home.marketAsOf, locale)}</strong>
            </div>
            <div className="signal-row">
              <span className="muted">{copy.retail22k}</span>
              <strong>{home.retail ? formatDate(home.retail.asOf, locale) : copy.pending}</strong>
            </div>
            <div className="signal-row">
              <span className="muted">{copy.heroBoardLabel}</span>
              <strong>{home.marketStale ? copy.heroBoardStale : copy.heroBoardFresh}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <p className="eyebrow">Vault</p>
          <h2>{copy.featureVaultTitle}</h2>
          <p className="muted">{copy.featureVaultCopy}</p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">Clarity</p>
          <h2>{copy.featureClarityTitle}</h2>
          <p className="muted">{copy.featureClarityCopy}</p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">Trust</p>
          <h2>{copy.featureTrustTitle}</h2>
          <p className="muted">{copy.featureTrustCopy}</p>
        </article>
      </section>
    </div>
  );
}

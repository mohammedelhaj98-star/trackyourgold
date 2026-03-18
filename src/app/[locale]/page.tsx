import Link from "next/link";
import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../lib/api";
import { currency, formatDate } from "../../lib/format";
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
  const max = Math.max(...chartPoints, 1);

  return (
    <div className="stack">
      <section className="hero-grid">
        <article className="hero-panel stack">
          <p className="eyebrow">Qatar gold today</p>
          <h1 className="hero-title">{currency(home.latestPrice22k)}</h1>
          <p className="hero-copy">{copy.heroTitle}</p>
          <p className="muted">{copy.heroSubtitle}</p>
          <div className="cta-row">
            <Link className="button" href={`/${locale}/signup`}>
              {copy.heroCta}
            </Link>
            <Link className="button button--ghost" href={`/${locale}/login`}>
              Login
            </Link>
          </div>
          <div className="notice">
            <strong>22K live board</strong>
            <div className="hero-copy">
              Updated {formatDate(home.marketAsOf)}. {home.marketStale ? "Using the latest available snapshot." : "Fresh market signal."}
            </div>
          </div>
        </article>

        <article className="hero-panel stack">
          <p className="eyebrow">At a glance</p>
          <div className="metric-grid">
            <div className="metric-card stack">
              <span className="muted">22K</span>
              <h2 className="metric-value">{currency(home.latestPrice22k)}</h2>
            </div>
            <div className="metric-card stack">
              <span className="muted">24K</span>
              <h2 className="metric-value">{currency(home.latestPrice24k)}</h2>
            </div>
            <div className="metric-card stack">
              <span className="muted">Retail</span>
              <h2 className="metric-value">
                {home.retail ? currency(home.retail.latestPrice22k) : "Pending"}
              </h2>
            </div>
          </div>
          <div className="chart-row" aria-hidden="true">
            {chartPoints.map((point, index) => (
              <span key={`${point}-${index}`} style={{ height: `${Math.max((point / max) * 100, 20)}%` }} />
            ))}
          </div>
        </article>
      </section>

      <section className="card-grid">
        <article className="content-card stack">
          <p className="eyebrow">Vault</p>
          <h2>Track every piece you own.</h2>
          <p className="muted">Jewelry, coins, bars, and scrap all live in one clean personal vault.</p>
        </article>
        <article className="content-card stack">
          <p className="eyebrow">Clarity</p>
          <h2>See value and profit in seconds.</h2>
          <p className="muted">Intrinsic, retail, and sell estimates are built around the same normalized QAR rates.</p>
        </article>
        <article className="content-card stack">
          <p className="eyebrow">Trust</p>
          <h2>Compliance-first ingestion.</h2>
          <p className="muted">Retail scraping is gated by robots rules and every raw snapshot is stored before parsing.</p>
        </article>
      </section>
    </div>
  );
}

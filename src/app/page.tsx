import Link from "next/link";
import type { RecommendationLabel } from "@prisma/client";

import { getHomepageData, getPublishedContentPages } from "@/lib/cms";
import { getHomepageMarketData } from "@/lib/home-market";

export const revalidate = 300;

function formatRecommendationLabel(label: string | RecommendationLabel | null) {
  switch (label) {
    case "STRONG_BUY":
      return "Strong buy";
    case "BUY":
      return "Buy";
    case "WAIT":
      return "Wait";
    case "AVOID":
      return "Avoid";
    default:
      return "Signal pending";
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-QA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatSignedPrice(value: number | null, currencyCode: string) {
  if (value == null || Number.isNaN(value)) return "Building";

  const absolute = Math.abs(value);
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${currencyCode} ${formatNumber(absolute)}`;
}

function formatUpdatedAt(value: Date | null) {
  if (!value) return "Awaiting fresh data";

  return new Intl.DateTimeFormat("en-QA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

function buildTrendPaths(points: number[]) {
  const safePoints = points.length >= 2 ? points : [528, 534, 531, 539, 544, 549, 553];
  const left = 24;
  const right = 416;
  const top = 52;
  const bottom = 182;
  const max = Math.max(...safePoints);
  const min = Math.min(...safePoints);
  const range = max - min || 1;
  const coordinates = safePoints.map((value, index) => {
    const x = left + ((right - left) * index) / (safePoints.length - 1);
    const y = bottom - ((value - min) / range) * (bottom - top);
    return { x, y };
  });

  let linePath = `M ${coordinates[0].x.toFixed(1)} ${coordinates[0].y.toFixed(1)}`;
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    const midX = (coordinates[index].x + coordinates[index + 1].x) / 2;
    const midY = (coordinates[index].y + coordinates[index + 1].y) / 2;
    linePath += ` Q ${coordinates[index].x.toFixed(1)} ${coordinates[index].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }

  const last = coordinates[coordinates.length - 1];
  linePath += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  const areaPath = `${linePath} L ${last.x.toFixed(1)} 220 L ${coordinates[0].x.toFixed(1)} 220 Z`;

  return {
    linePath,
    areaPath,
    midPoint: coordinates[Math.floor(coordinates.length / 2)],
    endPoint: last
  };
}

export default async function HomePage() {
  const [{ layout, page }, publishedPages, market] = await Promise.all([
    getHomepageData(),
    getPublishedContentPages(6),
    getHomepageMarketData()
  ]);

  const resetCopyTitle = "TrackYourGold is starting over on a cleaner foundation.";
  const usesResetCopy = page.title === resetCopyTitle;

  const heroTitle = usesResetCopy
    ? "Gold intelligence that answers the buy question fast."
    : page.title;
  const heroSummary = usesResetCopy
    ? "TrackYourGold is being rebuilt as a premium daily intelligence product for Qatar buyers who want a clear signal, not a dense wall of numbers."
    : page.summary ?? "Modern, answer-first gold intelligence for buyers who revisit daily.";
  const heroBody = usesResetCopy
    ? [
        "The homepage now centers the decision card first: recommendation, premium context, and the shape of the trend should all be obvious within the first screen.",
        "The rest of the product can expand behind that core promise, with admin-owned pages, localized intelligence, and a cleaner CMS-driven operating model."
      ]
    : page.body
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .slice(0, 2);
  const heroSupport =
    heroBody[0] ??
    "The first screen should communicate whether buyers should lean in, wait, or look deeper, without forcing them through dense data first.";

  const signalValue = market?.recommendationLabel
    ? formatRecommendationLabel(market.recommendationLabel)
    : page.heroMetricLabel && page.heroMetricLabel !== "Reset baseline"
      ? page.heroMetricLabel
      : "Signal pending";
  const priceHeadline = market
    ? `${market.countryName} ${market.karatLabel} gold price`
    : heroTitle;
  const priceValue = market ? `${market.currencyCode} ${formatNumber(market.pricePerGram)}` : null;
  const heroLead = market?.summaryText ?? heroSummary;
  const changeValue = market ? formatSignedPrice(market.change24h, market.currencyCode) : null;
  const premiumValue = market ? formatSignedPrice(market.premiumVsSpot, market.currencyCode) : null;
  const spotValue = market?.spotEstimate != null ? `${market.currencyCode} ${formatNumber(market.spotEstimate)}` : "Pending";
  const updatedAtLabel = market ? formatUpdatedAt(market.capturedAt) : "Awaiting fresh data";
  const confidenceLabel = market?.confidenceBand ?? "Building";
  const trendPaths = buildTrendPaths(market?.trendPoints ?? []);

  const productPillars = [
    {
      eyebrow: "Answer first",
      title: "Can I buy now?",
      body: "The product should answer that question within three seconds, before users need to scan details."
    },
    {
      eyebrow: "Localized context",
      title: "Qatar-first price intelligence",
      body: "Users should see local relevance immediately: premium behavior, store context, and a simple reading of market conditions."
    },
    {
      eyebrow: "Daily trust",
      title: "Built for repeat use",
      body: "Rounded cards, clean hierarchy, and a calm data rhythm make the product feel like a trusted daily habit."
    }
  ];

  const libraryLinks = publishedPages.slice(0, 3).map((contentPage) => ({
    label: contentPage.title,
    href: `/${contentPage.slug}`
  }));

  return (
    <div className="shell home-page">
      <section className="hero home-hero home-hero--centered">
        <div className="home-hero__copy home-hero__copy--centered stack">
          <p className="eyebrow home-eyebrow--centered">{layout.eyebrow}</p>
          <div className="home-price-stage stack">
            <span className="home-kicker">Qatar-first daily gold intelligence</span>
            <p className="home-price-stage__label">{priceHeadline}</p>
            <h1>
              {priceValue ?? heroTitle}
              {priceValue ? <span className="home-price-stage__unit"> / gram</span> : null}
            </h1>
            <div className="home-price-stage__meta">
              <span className="home-price-stage__meta-pill">{signalValue}</span>
              <span className="home-price-stage__meta-pill">{updatedAtLabel}</span>
              {changeValue ? <span className="home-price-stage__meta-pill">{changeValue} 24h</span> : null}
            </div>
          </div>

          <p className="home-hero__lead">{heroLead}</p>
          <p className="home-hero__support">{heroSupport}</p>

          <div className="home-trust-strip home-trust-strip--centered">
            <span className="home-trust-pill">{market?.karatLabel ?? "22K"} / gram</span>
            <span className="home-trust-pill">{premiumValue ? `${premiumValue} vs spot` : "Premium visible"}</span>
            <span className="home-trust-pill">{market ? `${spotValue} spot estimate` : "CMS-owned pages"}</span>
          </div>

          <div className="hero__actions home-hero__actions">
            <Link className="button" href={layout.primaryCtaHref}>
              {layout.primaryCtaLabel}
            </Link>
            <Link className="button button--secondary" href={layout.secondaryCtaHref}>
              {layout.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section decision-board">
        <div className="section-head section-head--centered">
          <div className="stack">
            <p className="eyebrow">Decision surface</p>
            <h2>One clean answer, then the supporting context.</h2>
          </div>
          <p className="muted">
            The homepage should tell users what state the market is in first, then let them read the trend and confidence signals without fighting through noise.
          </p>
        </div>

        <div className="decision-board__grid">
          <article className="signal-card signal-card--primary">
            <div className="signal-card__header">
              <div className="stack">
                <p className="eyebrow">Can I buy now?</p>
                <h2>{signalValue}</h2>
              </div>
              <span className="signal-chip">Homepage signal</span>
            </div>

            <div className="signal-answer">
              <span className="signal-answer__label">Current stance</span>
              <strong className="signal-answer__value">{signalValue}</strong>
              <p className="signal-answer__meta">
                {market?.summaryText ??
                  "This card is the future decision surface: recommendation, premium context, and trend direction should all be readable inside one glance."}
              </p>
            </div>

            <div className="signal-strip">
              <div className="signal-strip__item">
                <span>24h move</span>
                <strong>{changeValue ?? "Pending"}</strong>
              </div>
              <div className="signal-strip__item">
                <span>Premium vs spot</span>
                <strong>{premiumValue ?? "Pending"}</strong>
              </div>
              <div className="signal-strip__item">
                <span>Confidence</span>
                <strong>{confidenceLabel}</strong>
              </div>
            </div>
          </article>

          <article className="insight-panel">
            <div className="chart-shell">
              <div className="time-toggle" aria-hidden="true">
                <span className="time-chip">1D</span>
                <span className="time-chip">7D</span>
                <span className="time-chip time-chip--active">30D</span>
                <span className="time-chip">90D</span>
              </div>

              <div className="chart-preview">
                <svg viewBox="0 0 440 220" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="homeChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(120, 208, 255, 0.45)" />
                      <stop offset="100%" stopColor="rgba(120, 208, 255, 0)" />
                    </linearGradient>
                    <linearGradient id="homeChartLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#78d0ff" />
                      <stop offset="100%" stopColor="#f1c96f" />
                    </linearGradient>
                  </defs>
                  <path d="M24 182 H416" className="chart-gridline" />
                  <path d="M24 132 H416" className="chart-gridline" />
                  <path d="M24 82 H416" className="chart-gridline" />
                  <path
                    d={trendPaths.areaPath}
                    fill="url(#homeChartFill)"
                  />
                  <path
                    d={trendPaths.linePath}
                    fill="none"
                    stroke="url(#homeChartLine)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={trendPaths.midPoint.x.toFixed(1)}
                    cy={trendPaths.midPoint.y.toFixed(1)}
                    r="6"
                    className="chart-point"
                  />
                  <circle
                    cx={trendPaths.endPoint.x.toFixed(1)}
                    cy={trendPaths.endPoint.y.toFixed(1)}
                    r="7"
                    className="chart-point chart-point--accent"
                  />
                </svg>
              </div>

              <div className="chart-caption">
                <span>{market ? `${market.karatLabel} observed movement` : "Trend should read at a glance"}</span>
                <span>{market ? `${spotValue} spot estimate` : "Minimal chart language"}</span>
              </div>
            </div>

            <div className="insight-panel__copy stack">
              <p className="eyebrow">Price first</p>
              <h3>The number should land before the explanation.</h3>
              <p className="muted">
                The homepage now leads with the actual gold price. Recommendation, premium, and movement sit underneath it so visitors understand the market in seconds.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head section-head--centered">
          <div className="stack">
            <p className="eyebrow">Core principles</p>
            <h2>Cleaner, calmer, and easier to scan.</h2>
          </div>
          <p className="muted">
            The product should feel closer to a premium finance app than a legacy market website. Strong spacing and fewer choices do most of that work.
          </p>
        </div>

        <div className="home-card-grid home-card-grid--compact">
          {productPillars.map((pillar) => (
            <article key={pillar.title} className="home-card home-card--lift stack">
              <p className="eyebrow">{pillar.eyebrow}</p>
              <h3>{pillar.title}</h3>
              <p className="muted">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-final-card home-final-card--stacked">
          <div className="stack">
            <p className="eyebrow">Next state</p>
            <h2>A cleaner front door with room to grow behind it.</h2>
            <p className="muted">
              The deeper product can return gradually, but the homepage should stay disciplined: one hero, one signal board, and one calm visual rhythm.
            </p>
          </div>
          <div className="hero__actions">
            <Link className="button" href={layout.primaryCtaHref}>
              {layout.primaryCtaLabel}
            </Link>
            <Link className="button button--secondary" href="/health">
              Runtime health
            </Link>
          </div>

          {libraryLinks.length > 0 ? (
            <div className="home-library">
              <p className="eyebrow">Background SEO pages</p>
              <div className="home-library__links">
                {libraryLinks.map((link) => (
                  <Link key={link.href} className="text-link-pill" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

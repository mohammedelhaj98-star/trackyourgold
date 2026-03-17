import Link from "next/link";

import { getHomepageData, getPublishedContentPages } from "@/lib/cms";

export const revalidate = 300;

export default async function HomePage() {
  const [{ layout, page }, publishedPages] = await Promise.all([
    getHomepageData(),
    getPublishedContentPages(6)
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

  const signalValue =
    page.heroMetricLabel && page.heroMetricLabel !== "Reset baseline"
      ? page.heroMetricLabel
      : "Signal pending";

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
          <div className="home-hero__headline home-hero__headline--centered stack">
            <span className="home-kicker">Qatar-first daily gold intelligence</span>
            <h1>{heroTitle}</h1>
            <p className="home-hero__lead">{heroSummary}</p>
          </div>

          <p className="home-hero__support">{heroSupport}</p>

          <div className="home-trust-strip home-trust-strip--centered">
            <span className="home-trust-pill">Dark-mode first</span>
            <span className="home-trust-pill">Answer-first UX</span>
            <span className="home-trust-pill">CMS-owned pages</span>
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
                This card is the future decision surface: recommendation, premium context, and trend direction should all be readable inside one glance.
              </p>
            </div>

            <div className="signal-strip">
              <div className="signal-strip__item">
                <span>Confidence</span>
                <strong>Clear</strong>
              </div>
              <div className="signal-strip__item">
                <span>Premium</span>
                <strong>Visible</strong>
              </div>
              <div className="signal-strip__item">
                <span>Cadence</span>
                <strong>Daily</strong>
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
                    d="M24 182 C 58 174, 82 160, 110 150 C 144 138, 174 112, 208 116 C 240 118, 274 152, 308 142 C 340 132, 368 98, 416 86 L 416 220 L 24 220 Z"
                    fill="url(#homeChartFill)"
                  />
                  <path
                    d="M24 182 C 58 174, 82 160, 110 150 C 144 138, 174 112, 208 116 C 240 118, 274 152, 308 142 C 340 132, 368 98, 416 86"
                    fill="none"
                    stroke="url(#homeChartLine)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="208" cy="116" r="6" className="chart-point" />
                  <circle cx="416" cy="86" r="7" className="chart-point chart-point--accent" />
                </svg>
              </div>

              <div className="chart-caption">
                <span>Trend should read at a glance</span>
                <span>Minimal chart language</span>
              </div>
            </div>

            <div className="insight-panel__copy stack">
              <p className="eyebrow">Why it feels cleaner</p>
              <h3>Less surface area, stronger hierarchy.</h3>
              <p className="muted">
                A centered hero and one primary decision board create a clear reading order. Supporting context comes after the signal, not beside it in competing blocks.
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

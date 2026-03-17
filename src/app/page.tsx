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

  const workflowCards = [
    {
      index: "01",
      title: "Signal card",
      body: "A premium recommendation card sits above the fold with trend shape, confidence language, and the current action state."
    },
    {
      index: "02",
      title: "Context cards",
      body: "Premium versus spot, recent movement, and localized conditions sit beside the answer instead of hiding inside legacy tables."
    },
    {
      index: "03",
      title: "Deep dives later",
      body: "Historical pages, guides, and supporting SEO content remain available, but the main surface stays clean and focused."
    }
  ];

  const featuredPages =
    publishedPages.length > 0
      ? publishedPages.slice(0, 4).map((contentPage) => ({
          eyebrow: contentPage.type,
          title: contentPage.title,
          body: contentPage.summary ?? "Background SEO surface managed from the CMS.",
          href: `/${contentPage.slug}`,
          action: "Open page"
        }))
      : [
          {
            eyebrow: "Landing",
            title: "Country intelligence pages",
            body: "Localized landing pages should inherit the same calm visual system while staying answer-first.",
            href: "/admin",
            action: "Configure in admin"
          },
          {
            eyebrow: "Guide",
            title: "Buying guides",
            body: "Editorial pages should feel like premium product extensions, not a separate blog bolted onto the side.",
            href: "/admin",
            action: "Plan content"
          },
          {
            eyebrow: "FAQ",
            title: "Friction removal",
            body: "FAQs should clarify purchase confidence, timing, and premium context with strong visual hierarchy.",
            href: "/admin",
            action: "Manage FAQs"
          },
          {
            eyebrow: "Admin owned",
            title: "Daily publishing control",
            body: "The homepage and supporting surfaces should be editable without code changes once the CMS model is stable.",
            href: "/admin",
            action: "Open admin"
          }
        ];

  return (
    <div className="shell home-page">
      <section className="hero home-hero">
        <div className="home-hero__copy stack">
          <p className="eyebrow">{layout.eyebrow}</p>
          <div className="home-hero__headline stack">
            <span className="home-kicker">Premium daily gold intelligence</span>
            <h1>{heroTitle}</h1>
            <p className="home-hero__lead">{heroSummary}</p>
          </div>

          <div className="home-trust-strip">
            <span className="home-trust-pill">Dark-mode first</span>
            <span className="home-trust-pill">Answer-first UX</span>
            <span className="home-trust-pill">CMS-owned pages</span>
          </div>

          <div className="hero__actions">
            <Link className="button" href={layout.primaryCtaHref}>
              {layout.primaryCtaLabel}
            </Link>
            <Link className="button button--secondary" href={layout.secondaryCtaHref}>
              {layout.secondaryCtaLabel}
            </Link>
          </div>

          <div className="home-metrics">
            <div className="home-metric-card stack">
              <p className="eyebrow">Clarity</p>
              <h3>Decision surface first</h3>
              <p className="muted">The first screen is reserved for the answer, not for tables or dense technical clutter.</p>
            </div>
            <div className="home-metric-card stack">
              <p className="eyebrow">Cadence</p>
              <h3>{signalValue}</h3>
              <p className="muted">This slot becomes the daily buy-state once live market logic returns to the homepage.</p>
            </div>
            <div className="home-metric-card stack">
              <p className="eyebrow">Product tone</p>
              <h3>Premium, calm, modern</h3>
              <p className="muted">The design language should feel closer to a trusted portfolio product than a legacy gold website.</p>
            </div>
          </div>
        </div>

        <aside className="signal-card">
          <div className="signal-card__header">
            <div className="stack">
              <p className="eyebrow">Can I buy now?</p>
              <h2>Answer-first signal card</h2>
            </div>
            <span className="signal-chip">Homepage focus</span>
          </div>

          <div className="signal-answer">
            <span className="signal-answer__label">Current state</span>
            <strong className="signal-answer__value">{signalValue}</strong>
            <p className="signal-answer__meta">
              Live pricing is not wired into this card yet, but this is where the product should answer the buy question immediately.
            </p>
          </div>

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
              <span>Premium trend preview</span>
              <span>Minimal chart language</span>
            </div>
          </div>

          <div className="signal-grid">
            <div className="signal-stat">
              <span className="signal-stat__label">Local premium</span>
              <strong>Card-first</strong>
              <p>Premium context should read instantly, without a table scan.</p>
            </div>
            <div className="signal-stat">
              <span className="signal-stat__label">Momentum</span>
              <strong>Visual first</strong>
              <p>The line shape should communicate direction before the user opens details.</p>
            </div>
            <div className="signal-stat">
              <span className="signal-stat__label">Trust</span>
              <strong>Calm interface</strong>
              <p>Spacing, typography, and restrained color should make the product feel reliable.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="stack">
            <p className="eyebrow">Why this direction fits</p>
            <h2>Modern fintech language instead of legacy market clutter.</h2>
          </div>
          <p className="muted">
            The homepage should feel more like a trusted intelligence tool or premium portfolio product than a news site or a commodity table dump.
          </p>
        </div>

        <div className="home-card-grid">
          {productPillars.map((pillar) => (
            <article key={pillar.title} className="home-card home-card--lift stack">
              <p className="eyebrow">{pillar.eyebrow}</p>
              <h3>{pillar.title}</h3>
              <p className="muted">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--split">
        <article className="home-story stack">
          <p className="eyebrow">Homepage narrative</p>
          <h2>Fast to understand, easy to trust.</h2>
          <div className="home-story__body">
            {heroBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="workflow-grid">
          {workflowCards.map((card) => (
            <article key={card.index} className="workflow-card stack">
              <span className="workflow-card__index">{card.index}</span>
              <h3>{card.title}</h3>
              <p className="muted">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="stack">
            <p className="eyebrow">Background library</p>
            <h2>Supporting pages stay secondary to the main signal.</h2>
          </div>
          <p className="muted">
            SEO surfaces still matter, but they should inherit the same spacing, card rhythm, and premium product tone as the homepage.
          </p>
        </div>

        <div className="resource-grid">
          {featuredPages.map((resource) => (
            <article key={`${resource.eyebrow}-${resource.title}`} className="resource-card stack">
              <p className="eyebrow">{resource.eyebrow}</p>
              <h3>{resource.title}</h3>
              <p className="muted">{resource.body}</p>
              <Link className="button button--ghost" href={resource.href}>
                {resource.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-final-card">
          <div className="stack">
            <p className="eyebrow">Daily product promise</p>
            <h2>A homepage users want to revisit, not decode.</h2>
            <p className="muted">
              The next passes can wire live pricing, localized market signals, and richer CMS-driven sections into this layout without losing the calm, premium feel.
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
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

import { getHomepageData, getPublishedContentPages } from "@/lib/cms";

export const revalidate = 300;

export default async function HomePage() {
  const [{ layout, page }, publishedPages] = await Promise.all([
    getHomepageData(),
    getPublishedContentPages(6)
  ]);

  return (
    <div className="shell page-grid">
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">{layout.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
        </div>

        <div className="hero__actions">
          <Link className="button" href={layout.primaryCtaHref}>
            {layout.primaryCtaLabel}
          </Link>
          <Link className="button button--secondary" href={layout.secondaryCtaHref}>
            {layout.secondaryCtaLabel}
          </Link>
        </div>

        <div className="hero__metrics">
          <div className="metric-card stack">
            <p className="eyebrow">Runtime gate</p>
            <h3>Minimal Next runtime</h3>
            <p className="muted">This baseline keeps the route surface intentionally small until Hostinger startup is proven stable.</p>
          </div>
          <div className="metric-card stack">
            <p className="eyebrow">Health</p>
            <h3>{page.heroMetricLabel ?? "Existing MySQL schema kept intact"}</h3>
            <span className="status-pill status-pill--healthy">Use /health for live DB checks</span>
          </div>
          <div className="metric-card stack">
            <p className="eyebrow">CMS ownership</p>
            <h3>Homepage + admin first</h3>
            <p className="muted">Content, navigation, taxonomy, redirects, and settings now have a single reset-focused admin surface.</p>
          </div>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel stack">
          <p className="eyebrow">Why this reset exists</p>
          <h2>Stability before scale.</h2>
          <p className="muted">{page.intro}</p>
        </article>
        <article className="panel stack">
          <p className="eyebrow">What was intentionally removed</p>
          <ul className="feature-list">
            <li>Old public SEO route tree</li>
            <li>Legacy admin panels and dashboards</li>
            <li>Pricing ingestion and scraper runtime</li>
            <li>Heavy page-level server logic at startup</li>
          </ul>
        </article>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Reset body copy</p>
        <div className="article__body">
          {page.body.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph.trim()}</p>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <div className="stack">
          <p className="eyebrow">Published pages</p>
          <h2>Template-driven pages that already exist in the database.</h2>
          <p className="muted">
            These are rendered through the reset catch-all page renderer instead of the archived route tree.
          </p>
        </div>
        {publishedPages.length > 0 ? (
          <div className="card-grid">
            {publishedPages.map((contentPage) => (
              <article key={contentPage.id} className="article-panel stack">
                <p className="eyebrow">{contentPage.type}</p>
                <h3>{contentPage.title}</h3>
                <p className="muted">{contentPage.summary ?? "No summary yet."}</p>
                <Link className="button button--ghost" href={`/${contentPage.slug}`}>
                  Open page
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state stack">
            <h3>No published pages yet.</h3>
            <p className="muted">Create them from the admin CMS once the runtime gate is stable.</p>
          </div>
        )}
      </section>
    </div>
  );
}

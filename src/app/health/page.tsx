import { db, checkDatabase } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

async function getHealthCounts() {
  if (!hasDatabaseConfig()) {
    return null;
  }

  try {
    const [users, pages, countries, articles, faqs] = await Promise.all([
      db.user.count(),
      db.contentPage.count(),
      db.country.count(),
      db.blogArticle.count(),
      db.faq.count()
    ]);

    return { users, pages, countries, articles, faqs };
  } catch {
    return null;
  }
}

export default async function HealthPage() {
  const [database, counts] = await Promise.all([checkDatabase(), getHealthCounts()]);

  return (
    <div className="shell health-shell">
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">Runtime gate</p>
          <h1>Health check</h1>
          <p>
            This page exists to prove the app can start, render, and optionally talk to the existing database
            without loading the archived product surface.
          </p>
        </div>
        <div className="hero__metrics">
          <div className="metric-card stack">
            <p className="eyebrow">Application</p>
            <h3>Next runtime is responding.</h3>
            <span className="status-pill status-pill--healthy">Healthy</span>
          </div>
          <div className="metric-card stack">
            <p className="eyebrow">Database</p>
            <h3>{database.ok ? "Read-only validation passed" : "Connection not healthy"}</h3>
            <span className={`status-pill ${database.ok ? "status-pill--healthy" : "status-pill--error"}`}>
              {database.ok ? "connected" : database.status}
            </span>
            {!database.ok && "message" in database ? <p className="muted">{database.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="health-card stack">
        <p className="eyebrow">Database counts</p>
        {counts ? (
          <div className="card-grid">
            <div className="metric-card stack">
              <h3>{counts.users}</h3>
              <p className="muted">Users</p>
            </div>
            <div className="metric-card stack">
              <h3>{counts.pages}</h3>
              <p className="muted">Content pages</p>
            </div>
            <div className="metric-card stack">
              <h3>{counts.articles}</h3>
              <p className="muted">Articles</p>
            </div>
            <div className="metric-card stack">
              <h3>{counts.faqs}</h3>
              <p className="muted">FAQs</p>
            </div>
            <div className="metric-card stack">
              <h3>{counts.countries}</h3>
              <p className="muted">Countries</p>
            </div>
          </div>
        ) : (
          <div className="notice">
            Count queries are unavailable until a working <code>DATABASE_URL</code> is configured.
          </div>
        )}
      </section>
    </div>
  );
}

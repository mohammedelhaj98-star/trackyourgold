import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import { isLocale, messages } from "../../../lib/i18n";

export default async function SourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = messages[locale];
  const payload = await readJson<{
    sources: Array<{
      code: string;
      name: string;
      enabled: boolean;
      lastSuccessAt: string | null;
      consecutiveFailures: number;
      stale: boolean;
      lastError: string | null;
    }>;
  }>(await apiFetch("/v1/sources/status"));

  return (
    <section className="content-card stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.sourcesTitle}</p>
          <h1 className="section-title">{copy.sourcesTitle}</h1>
        </div>
      </div>
      <p className="muted">{copy.sourcesIntro}</p>
      <div className="list list--rows">
        {payload.sources.map((source) => (
          <div key={source.code} className="item-card item-card--row">
            <div className="row-main">
              <strong>{source.name}</strong>
              <span className="muted">{source.code}</span>
            </div>
            <div className="row-end row-end--stack">
              <span className={source.stale ? "status-bad" : "status-good"}>
                {source.stale ? copy.stale : copy.healthy}
              </span>
              <span className="muted">
                {copy.failures}: {source.consecutiveFailures}
              </span>
              <span className="muted">
                {copy.lastUpdated}: {source.lastSuccessAt ? formatDate(source.lastSuccessAt, locale) : copy.pending}
              </span>
              {source.lastError ? <span className="status-bad">{source.lastError}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

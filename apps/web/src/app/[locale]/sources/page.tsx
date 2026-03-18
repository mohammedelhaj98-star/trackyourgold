import { notFound } from "next/navigation";

import { apiFetch, readJson } from "../../../lib/api";
import { isLocale, messages } from "../../../lib/i18n";

export default async function SourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

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
      <p className="eyebrow">{messages[locale].sourcesTitle}</p>
      <div className="list">
        {payload.sources.map((source) => (
          <div key={source.code} className="status-row content-card stack">
            <strong>{source.name}</strong>
            <span className="muted">{source.code}</span>
            <span className={source.stale ? "status-bad" : "status-good"}>
              {source.stale ? "Stale" : "Healthy"}
            </span>
            <span className="muted">Failures: {source.consecutiveFailures}</span>
            {source.lastError ? <span className="status-bad">{source.lastError}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";

import { savePreferencesAction } from "../../../lib/actions";
import { apiFetch, readJson } from "../../../lib/api";
import { requireUser } from "../../../lib/auth";
import { formatDate } from "../../../lib/format";
import { isLocale } from "../../../lib/i18n";
import { getUiPreferences } from "../../../lib/preferences";
import { getRuntimeUi } from "../../../lib/ui-config";

export default async function SettingsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const ui = await getRuntimeUi(locale);
  const copy = ui.copy;
  const [preferences, sources, query] = await Promise.all([
    getUiPreferences(),
    readJson<{
      sources: Array<{
        code: string;
        name: string;
        enabled: boolean;
        lastSuccessAt: string | null;
        consecutiveFailures: number;
        stale: boolean;
        lastError: string | null;
      }>;
    }>(await apiFetch("/v1/sources/status")),
    searchParams
  ]);
  const boundSavePreferences = savePreferencesAction.bind(null, locale);

  return (
    <div className="dashboard-grid">
      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.settings.title}</p>
            <h1 className="section-title">{copy.settings.title}</h1>
          </div>
        </div>
        <p className="muted">{copy.settings.intro}</p>

        {query.saved === "1" ? (
          <div className="notice notice--success">
            <strong>{copy.settings.preferencesSaved}</strong>
          </div>
        ) : null}

        <form className="form" action={boundSavePreferences}>
          <section className="settings-group">
            <p className="eyebrow">{copy.settings.valuationPreferences}</p>
            <div className="toggle-list">
              <label className="toggle-row">
                <span>{copy.settings.showRetailComparison}</span>
                <input type="checkbox" name="showRetailComparison" defaultChecked={preferences.showRetailComparison} />
              </label>
              <label className="toggle-row">
                <span>{copy.settings.showGainLossWhenBasisExists}</span>
                <input
                  type="checkbox"
                  name="showGainLossWhenBasisExists"
                  defaultChecked={preferences.showGainLossWhenBasisExists}
                />
              </label>
              <label className="toggle-row">
                <span>{copy.settings.reduceMotion}</span>
                <input type="checkbox" name="reduceMotion" defaultChecked={preferences.reduceMotion} />
              </label>
            </div>
          </section>

          <section className="settings-group">
            <p className="eyebrow">{copy.common.privacy}</p>
            <div className="notice">
              <strong>{copy.settings.privateAccountTitle}</strong>
              <span>{copy.settings.privateAccountCopy}</span>
            </div>
          </section>

          <button type="submit">{copy.settings.savePreferences}</button>
        </form>
      </section>

      <aside className="stack">
        <section className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.settings.dataFreshness}</p>
              <h2 className="panel-title">{copy.settings.dataFreshness}</h2>
            </div>
          </div>
          <div className="list list--rows">
            {sources.sources.map((source) => (
              <div key={source.code} className="item-card item-card--row">
                <div className="row-main">
                  <strong>{source.name}</strong>
                  <span className="muted">{source.code}</span>
                </div>
                <div className="row-end row-end--stack">
                  <span className={source.stale ? "status-bad" : "status-good"}>
                    {source.stale ? copy.common.stale : copy.common.healthy}
                  </span>
                  <span className="muted">
                    {copy.settings.sourceFailures}: {source.consecutiveFailures}
                  </span>
                  <span className="muted">
                    {copy.common.lastUpdated}: {source.lastSuccessAt ? formatDate(source.lastSuccessAt, locale) : copy.common.pending}
                  </span>
                  {source.lastError ? <span className="status-bad">{source.lastError}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.settings.disclaimersTitle}</p>
              <h2 className="panel-title">{copy.settings.disclaimersTitle}</h2>
            </div>
          </div>
          <p className="muted">{copy.settings.disclaimersCopy}</p>
        </section>

        <section className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.settings.adsTitle}</p>
              <h2 className="panel-title">{copy.settings.adsTitle}</h2>
            </div>
          </div>
          <p className="muted">{copy.settings.adsCopy}</p>
          {ui.ads.settings.enabled ? <div className="notice"><strong>{ui.ads.settings.title}</strong><span>{ui.ads.settings.copy}</span></div> : null}
        </section>
      </aside>
    </div>
  );
}

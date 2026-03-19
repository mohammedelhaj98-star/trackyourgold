import { notFound } from "next/navigation";

import { requireUser } from "../../../lib/auth";
import { formatNumber } from "../../../lib/format";
import { getAchievementLabel, getTierLabel, isLocale } from "../../../lib/i18n";
import { computeAchievements, computeTierProgress, loadPortfolioState } from "../../../lib/portfolio";
import { getRuntimeUi } from "../../../lib/ui-config";

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const copy = (await getRuntimeUi(locale)).copy;
  const { holdings, summary } = await loadPortfolioState();
  const progress = computeTierProgress(summary.fineGoldGrams);
  const achievements = computeAchievements(holdings);

  return (
    <div className="stack stack--page">
      <section className="dashboard-grid">
        <article className="hero-surface hero-surface--primary stack">
          <div className="hero-heading">
            <div>
              <p className="eyebrow">{copy.progress.title}</p>
              <h1 className="hero-title">{getTierLabel(copy, progress.currentTier)}</h1>
            </div>
            <span className="panel-chip">{progress.tierProgressPct}%</span>
          </div>
          <p className="hero-copy">{copy.progress.intro}</p>
          <div className="hero-stat-strip">
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.common.fineGoldGrams}</span>
              <strong>{formatNumber(summary.fineGoldGrams, locale, 2)}g</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.progress.nextTier}</span>
              <strong>{progress.nextTier ? getTierLabel(copy, progress.nextTier) : copy.progress.legacy}</strong>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">{copy.progress.gramsToNextTier}</span>
              <strong>{formatNumber(progress.gramsToNextTier, locale, 2)}g</strong>
            </div>
          </div>
          <div className="progress-bar progress-bar--hero">
            <span style={{ width: `${progress.tierProgressPct}%` }} />
          </div>
        </article>

        <aside className="content-card stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.progress.achievements}</p>
              <h2 className="panel-title">{copy.progress.achievements}</h2>
            </div>
          </div>
          <p className="muted">{copy.progress.intro}</p>
          {holdings.length ? (
            <div className="achievement-grid">
              {achievements.map((achievement) => (
                <div
                  key={achievement.key}
                  className={`achievement-card ${achievement.unlocked ? "achievement-card--unlocked" : ""}`}
                >
                  <strong>{getAchievementLabel(copy, achievement.key)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="notice">
              <strong>{copy.progress.emptyTitle}</strong>
              <span>{copy.progress.emptyCopy}</span>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

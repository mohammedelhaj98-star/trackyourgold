import Link from "next/link";

import type { PropsWithChildren } from "react";

import { getOtherLocale, messages, type Locale } from "../lib/i18n";

export function Shell({ children, locale }: PropsWithChildren<{ locale: Locale }>) {
  const copy = messages[locale];
  const otherLocale = getOtherLocale(locale);

  return (
    <div className="chrome">
      <header className="topbar">
        <div className="brand-block">
          <Link href={`/${locale}`} className="brand">
            TrackYourGold
          </Link>
          <p className="brand-tag">{copy.brandTagline}</p>
        </div>

        <div className="topbar-actions">
          <nav className="nav">
            <Link className="nav-link" href={`/${locale}/dashboard`}>
              {copy.navDashboard}
            </Link>
            <Link className="nav-link" href={`/${locale}/vaults`}>
              {copy.navVaults}
            </Link>
            <Link className="nav-link" href={`/${locale}/sources`}>
              {copy.navSources}
            </Link>
          </nav>

          <div className="topbar-actions">
            <Link className="locale-link" href={`/${otherLocale}`}>
              {copy.localeSwitch}
            </Link>
            <Link className="button button--ghost button--compact" href={`/${locale}/login`}>
              {copy.navLogin}
            </Link>
          </div>
        </div>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  );
}

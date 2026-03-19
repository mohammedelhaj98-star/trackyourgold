import Link from "next/link";

import type { CSSProperties, PropsWithChildren } from "react";

import { logoutAction } from "../lib/actions";
import { getOtherLocale, type Locale, type MessageCatalog } from "../lib/i18n";
import type { UiPreferences } from "../lib/preferences";
import { AppNav } from "./app-nav";

export type ShellUser = {
  user: { id: string; email: string; language: string };
  defaultVaultId: string | null;
} | null;

export function Shell({
  children,
  locale,
  me,
  preferences,
  copy,
  themeStyle
}: PropsWithChildren<{
  locale: Locale;
  me: ShellUser;
  preferences: UiPreferences;
  copy: MessageCatalog;
  themeStyle: Record<string, string>;
}>) {
  const otherLocale = getOtherLocale(locale);
  const boundLogout = logoutAction.bind(null, locale);
  const addHref = me?.defaultVaultId ? `/${locale}/items/new?vaultId=${me.defaultVaultId}` : `/${locale}/items/new`;

  return (
    <div
      className="chrome"
      data-reduce-motion={preferences.reduceMotion ? "true" : "false"}
      style={themeStyle as CSSProperties}
    >
      <header className="topbar">
        <div className="brand-block">
          <Link href={`/${locale}`} className="brand">
            TrackYourGold
          </Link>
          <p className="brand-tag">{copy.brandTagline}</p>
        </div>

        <div className="topbar-actions">
          <AppNav
            locale={locale}
            authenticated={Boolean(me)}
            labels={{
              home: copy.nav.home,
              portfolio: copy.nav.portfolio,
              progress: copy.nav.progress,
              settings: copy.nav.settings
            }}
          />

          <div className="topbar-cta">
            <Link className="locale-link" href={`/${otherLocale}`}>
              {copy.localeSwitch}
            </Link>

            {me ? (
              <>
                <Link className="button button--ghost button--compact" href={addHref as never}>
                  {copy.nav.addGold}
                </Link>
                <form action={boundLogout}>
                  <button type="submit" className="button button--ghost button--compact">
                    {copy.nav.logout}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="button button--ghost button--compact" href={`/${locale}/login`}>
                  {copy.nav.login}
                </Link>
                <Link className="button button--compact" href={`/${locale}/signup`}>
                  {copy.nav.signup}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page-shell">{children}</main>
      <AppNav
        locale={locale}
        authenticated={Boolean(me)}
        labels={{
          home: copy.nav.home,
          portfolio: copy.nav.portfolio,
          progress: copy.nav.progress,
          settings: copy.nav.settings
        }}
      />
    </div>
  );
}

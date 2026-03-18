import Link from "next/link";

import type { PropsWithChildren } from "react";

import type { Locale } from "../lib/i18n";

export function Shell({ children, locale }: PropsWithChildren<{ locale: Locale }>) {
  return (
    <div className="chrome">
      <header className="topbar">
        <Link href={`/${locale}`} className="brand">
          TrackYourGold
        </Link>
        <nav className="nav">
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
          <Link href={`/${locale}/vaults`}>Vaults</Link>
          <Link href={`/${locale}/sources`}>Sources</Link>
        </nav>
      </header>
      <main className="page-shell">{children}</main>
    </div>
  );
}

import type { PropsWithChildren } from "react";

import { notFound } from "next/navigation";

import { Shell } from "../../components/shell";
import { getCurrentUser } from "../../lib/auth";
import { getDirection, isLocale, type Locale } from "../../lib/i18n";
import { getUiPreferences } from "../../lib/preferences";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const safeLocale: Locale = locale;
  const [me, preferences] = await Promise.all([getCurrentUser(), getUiPreferences()]);

  return (
    <div lang={safeLocale} dir={getDirection(safeLocale)} className="locale-root">
      <Shell locale={safeLocale} me={me} preferences={preferences}>
        {children}
      </Shell>
    </div>
  );
}

import type { PropsWithChildren } from "react";

import { notFound } from "next/navigation";

import { getDirection, isLocale, type Locale } from "../../lib/i18n";
import { Shell } from "../../components/shell";

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
  return (
    <div lang={safeLocale} dir={getDirection(safeLocale)}>
      <Shell locale={safeLocale}>{children}</Shell>
    </div>
  );
}

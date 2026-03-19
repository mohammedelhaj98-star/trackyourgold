import { redirect } from "next/navigation";

import { isLocale } from "../../../lib/i18n";

export default async function SourcesRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect("/en/settings" as never);
  }

  redirect(`/${locale}/settings` as never);
}

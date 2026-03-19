import { redirect } from "next/navigation";

import { isLocale } from "../../../lib/i18n";

export default async function DashboardRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect("/en");
  }

  redirect(`/${locale}`);
}

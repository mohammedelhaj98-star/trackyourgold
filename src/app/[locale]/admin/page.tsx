import { notFound } from "next/navigation";

import { AdminEditor } from "../../../components/admin-editor";
import { adminLogoutAction } from "../../../lib/actions";
import { requireAdmin } from "../../../lib/admin-auth";
import { isLocale } from "../../../lib/i18n";
import { getAdminUiConfig } from "../../../lib/ui-config";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const admin = await requireAdmin(locale);
  const config = await getAdminUiConfig();
  const boundLogout = adminLogoutAction.bind(null, locale);

  return (
    <div className="stack stack--page">
      <section className="content-card admin-header">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Admin Workspace</p>
            <h1 className="section-title">TrackYourGold UI Controls</h1>
          </div>
          <form action={boundLogout}>
            <button type="submit" className="button button--ghost">
              Sign out
            </button>
          </form>
        </div>
      </section>

      <AdminEditor initialConfig={config} adminName={admin.user.username ?? admin.user.email} />
    </div>
  );
}

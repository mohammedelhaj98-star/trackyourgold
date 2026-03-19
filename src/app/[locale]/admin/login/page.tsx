import { notFound } from "next/navigation";

import { adminLoginAction } from "../../../../lib/actions";
import { isLocale } from "../../../../lib/i18n";
import { getRuntimeUi } from "../../../../lib/ui-config";

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = (await getRuntimeUi(locale)).copy;

  return (
    <section className="auth-shell">
      <article className="auth-side">
        <p className="eyebrow">Admin</p>
        <h1 className="section-title">Open the UI editor</h1>
        <p className="muted">Sign in with the bootstrap admin username and password to edit live copy and theme settings.</p>
      </article>

      <section className="form-card stack">
        <form className="form" action={adminLoginAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" required />
          </div>
          <div className="field">
            <label htmlFor="password">{copy.auth.password}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit">Open admin</button>
        </form>
      </section>
    </section>
  );
}

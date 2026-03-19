import Link from "next/link";
import { notFound } from "next/navigation";

import { loginAction } from "../../../lib/actions";
import { isLocale } from "../../../lib/i18n";
import { getRuntimeUi } from "../../../lib/ui-config";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = (await getRuntimeUi(locale)).copy;

  return (
    <section className="auth-shell">
      <article className="auth-side">
        <p className="eyebrow">{copy.auth.loginEyebrow}</p>
        <h1 className="section-title">{copy.auth.loginTitle}</h1>
        <p className="muted">{copy.auth.loginIntro}</p>
      </article>

      <section className="form-card stack">
        <form className="form" action={loginAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="email">{copy.auth.email}</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">{copy.auth.password}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit">{copy.nav.login}</button>
        </form>
        <p className="muted">
          <Link href={`/${locale}/signup`} className="link-inline">
            {copy.nav.signup}
          </Link>
        </p>
      </section>
    </section>
  );
}

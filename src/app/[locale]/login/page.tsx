import { notFound } from "next/navigation";

import { loginAction } from "../../../lib/actions";
import { isLocale, messages } from "../../../lib/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = messages[locale];

  return (
    <section className="auth-shell">
      <article className="auth-side">
        <p className="eyebrow">{copy.loginEyebrow}</p>
        <h1 className="section-title">{copy.loginTitle}</h1>
        <p className="muted">{copy.loginIntro}</p>
      </article>

      <section className="form-card stack">
        <p className="eyebrow">{copy.loginEyebrow}</p>
        <form className="form" action={loginAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="email">{copy.email}</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">{copy.password}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit">{copy.navLogin}</button>
        </form>
      </section>
    </section>
  );
}

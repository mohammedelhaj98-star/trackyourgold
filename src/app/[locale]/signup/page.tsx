import { notFound } from "next/navigation";

import { signupAction } from "../../../lib/actions";
import { isLocale, messages } from "../../../lib/i18n";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = messages[locale];

  return (
    <section className="auth-shell">
      <article className="auth-side">
        <p className="eyebrow">{copy.signupEyebrow}</p>
        <h1 className="section-title">{copy.signupTitle}</h1>
        <p className="muted">{copy.signupIntro}</p>
      </article>

      <section className="form-card stack">
        <p className="eyebrow">{copy.signupEyebrow}</p>
        <form className="form" action={signupAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="email">{copy.email}</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">{copy.password}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit">{copy.navSignup}</button>
        </form>
      </section>
    </section>
  );
}

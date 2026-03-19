import Link from "next/link";
import { notFound } from "next/navigation";

import { signupAction } from "../../../lib/actions";
import { isLocale } from "../../../lib/i18n";
import { getRuntimeUi } from "../../../lib/ui-config";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const copy = (await getRuntimeUi(locale)).copy;

  return (
    <section className="auth-shell">
      <article className="auth-side">
        <p className="eyebrow">{copy.auth.signupEyebrow}</p>
        <h1 className="section-title">{copy.auth.signupTitle}</h1>
        <p className="muted">{copy.auth.signupIntro}</p>
      </article>

      <section className="form-card stack">
        <form className="form" action={signupAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="email">{copy.auth.email}</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">{copy.auth.password}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit">{copy.nav.signup}</button>
        </form>
        <p className="muted">
          <Link href={`/${locale}/login`} className="link-inline">
            {copy.nav.login}
          </Link>
        </p>
      </section>
    </section>
  );
}

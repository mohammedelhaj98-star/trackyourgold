import { notFound } from "next/navigation";

import { signupAction } from "../../../lib/actions";
import { isLocale } from "../../../lib/i18n";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <section className="form-card stack">
      <p className="eyebrow">Create account</p>
      <h1>Start your gold vault</h1>
      <form className="form" action={signupAction}>
        <input type="hidden" name="locale" value={locale} />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit">Create account</button>
      </form>
    </section>
  );
}

import { notFound } from "next/navigation";

import { loginAction } from "../../../lib/actions";
import { isLocale } from "../../../lib/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <section className="form-card stack">
      <p className="eyebrow">Admin access</p>
      <h1>Open your vault</h1>
      <form className="form" action={loginAction}>
        <input type="hidden" name="locale" value={locale} />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </section>
  );
}

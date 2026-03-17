import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="shell">
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">404</p>
          <h1>That route has not been rebuilt yet.</h1>
          <p>
            The reset baseline only exposes homepage, health, login, admin, and CMS-rendered published pages.
            Missing routes are expected while the site is rebuilt in smaller, stable slices.
          </p>
        </div>
        <div className="hero__actions">
          <Link className="button" href="/">
            Back to homepage
          </Link>
          <Link className="button button--secondary" href="/admin">
            Open admin
          </Link>
        </div>
      </section>
    </div>
  );
}

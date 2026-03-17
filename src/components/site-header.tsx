import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { getNavigationLinks } from "@/lib/cms";

export async function SiteHeader() {
  const [user, navigation] = await Promise.all([getCurrentUser(), getNavigationLinks()]);

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark">TG</span>
          <span>
            <strong>TrackYourGold</strong>
            <span className="brand__sub">reset baseline</span>
          </span>
        </Link>
        <nav className="site-nav">
          {navigation.map((item) => (
            <Link key={`${item.label}:${item.href}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          {user?.role === "ADMIN" ? <Link className="button button--secondary" href="/admin">Admin</Link> : null}
          <Link className="button button--ghost" href="/login">{user ? "Switch account" : "Login"}</Link>
        </div>
      </div>
    </header>
  );
}


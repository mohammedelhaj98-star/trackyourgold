import Link from "next/link";

import type { NavigationLink } from "@/lib/cms";

type SiteHeaderProps = {
  navigation: NavigationLink[];
};

export function SiteHeader({ navigation }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark">TG</span>
          <span>
            <strong>TrackYourGold</strong>
            <span className="brand__sub">daily gold intelligence</span>
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
          <Link className="button button--secondary" href="/admin">Admin</Link>
          <Link className="button button--ghost" href="/login">Login</Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "../lib/i18n";

type NavProps = {
  locale: Locale;
  authenticated: boolean;
  labels: {
    home: string;
    portfolio: string;
    progress: string;
    settings: string;
  };
};

const AUThed_DESTINATIONS = [
  { key: "home", href: (locale: Locale) => `/${locale}` },
  { key: "portfolio", href: (locale: Locale) => `/${locale}/vaults` },
  { key: "progress", href: (locale: Locale) => `/${locale}/progress` },
  { key: "settings", href: (locale: Locale) => `/${locale}/settings` }
] as const;

function isActive(pathname: string, href: string) {
  if (href.endsWith(`/${pathname.split("/").pop()}`) && pathname === href) {
    return true;
  }

  if (href.endsWith("/vaults")) {
    return pathname.startsWith(href);
  }

  return pathname === href;
}

export function AppNav({ locale, authenticated, labels }: NavProps) {
  const pathname = usePathname();

  if (!authenticated || pathname.includes(`/${locale}/admin`)) {
    return null;
  }

  return (
    <>
      <nav className="nav nav--desktop" aria-label="Primary">
        {AUThed_DESTINATIONS.map((item) => {
          const href = item.href(locale);
          return (
            <Link
              key={item.key}
              className={`nav-link ${isActive(pathname, href) ? "nav-link--active" : ""}`}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              href={href as never}
            >
              {labels[item.key]}
            </Link>
          );
        })}
      </nav>

      <nav className="bottom-nav" aria-label="Mobile">
        {AUThed_DESTINATIONS.map((item) => {
          const href = item.href(locale);
          return (
            <Link
              key={item.key}
              className={`bottom-nav__item ${isActive(pathname, href) ? "bottom-nav__item--active" : ""}`}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              href={href as never}
            >
              <span className="bottom-nav__label">{labels[item.key]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-base-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-200 via-gold-300 to-gold-500 font-display text-lg font-bold text-base-950">
            TG
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-white">TrackYourGold</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">trackyourgold.com</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              {user.role === "ADMIN" ? <Button href="/admin" variant="secondary">Admin</Button> : null}
              <Button href="/dashboard" variant="secondary">Dashboard</Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost">Login</Button>
              <Button href="/register">Create account</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

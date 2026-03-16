import Link from "next/link";
import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/guards";
import { siteConfig } from "@/lib/constants";
import { logoutAction } from "@/server/actions/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Account</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white">{user.name ?? user.email}</h1>
        <p className="mt-1 text-sm text-white/60">{user.plan} plan</p>
        <nav className="mt-8 flex flex-col gap-3">
          {siteConfig.dashboardNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/" className="rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">Public site</Link>
        </nav>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 transition hover:text-white">
            Logout
          </button>
        </form>
      </aside>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

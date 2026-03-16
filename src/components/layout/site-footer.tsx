import Link from "next/link";

import { AdSlot } from "@/components/layout/ad-slot";
import { siteConfig } from "@/lib/constants";

export async function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-base-950/85">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8">
        <AdSlot slotKey="footer-banner" className="min-h-[120px]" />
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-semibold text-white">TrackYourGold</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
              Track local Qatar gold rates, compare them with global benchmarks, and grow search traffic, alerts, and premium monetization from one architecture.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              {siteConfig.nav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Account</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <Link href="/alerts" className="transition hover:text-white">Price drop alerts</Link>
              <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
              <Link href="/register" className="transition hover:text-white">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

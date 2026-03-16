import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold text-white">Page not found</h1>
      <p className="mt-4 text-sm leading-7 text-white/65">The page may have moved, or the SEO route is not published yet.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Homepage</Button>
        <Button href="/gold-insights" variant="secondary">Gold Insights</Button>
      </div>
    </div>
  );
}

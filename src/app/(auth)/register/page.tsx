import Link from "next/link";

import { registerAction } from "@/server/actions/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Register",
  description: "Create a TrackYourGold account.",
  path: "/register",
  noIndex: true
});

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next ?? "/dashboard";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md items-center px-6 py-10">
      <div className="w-full rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Account creation</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">Create your account</h1>
        {params.error ? <p className="mt-4 text-sm text-rose-300">{params.error}</p> : null}
        <form action={registerAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <input name="name" placeholder="Name" className="w-full rounded-3xl border border-white/12 bg-white/5 px-4 py-4 text-white" />
          <input name="email" type="email" placeholder="Email" className="w-full rounded-3xl border border-white/12 bg-white/5 px-4 py-4 text-white" />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-3xl border border-white/12 bg-white/5 px-4 py-4 text-white" />
          <button type="submit" className="w-full rounded-full bg-gold-300 px-5 py-3 font-semibold text-base-950">Create account</button>
        </form>
        <p className="mt-6 text-sm text-white/65">Already have an account? <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="text-gold-200">Login</Link></p>
      </div>
    </div>
  );
}

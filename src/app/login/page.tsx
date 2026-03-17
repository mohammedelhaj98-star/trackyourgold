import Link from "next/link";

import { loginAction } from "@/app/admin/actions";
import { hasDatabaseConfig, hasSessionConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = readParam(resolvedSearchParams, "error");
  const message = readParam(resolvedSearchParams, "message");
  const nextPath = readParam(resolvedSearchParams, "next") ?? "/admin";
  const authReady = hasDatabaseConfig() && hasSessionConfig();

  return (
    <div className="shell login-shell">
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">Admin access</p>
          <h1>Login to manage the reset.</h1>
          <p>
            This baseline only includes the minimum auth flow required to operate the CMS and prove runtime
            stability on Hostinger.
          </p>
        </div>
      </section>

      <section className="form-card stack">
        {message ? <div className="notice notice--success">{message}</div> : null}
        {error ? <div className="notice notice--error">{error}</div> : null}
        {!authReady ? (
          <div className="notice notice--error">
            Login is disabled until both <code>DATABASE_URL</code> and <code>SESSION_SECRET</code> are configured.
          </div>
        ) : null}

        <form action={loginAction} className="form-stack">
          <input type="hidden" name="next" value={nextPath} />

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          <div className="button-row">
            <button className="button" type="submit" disabled={!authReady}>
              Open admin
            </button>
            <Link className="button button--secondary" href="/">
              Back home
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

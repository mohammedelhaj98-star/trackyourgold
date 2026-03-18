import Link from "next/link";
import { notFound } from "next/navigation";

import { createVaultAction } from "../../../lib/actions";
import { requireUser } from "../../../lib/auth";
import { apiFetch, readJson } from "../../../lib/api";
import { isLocale } from "../../../lib/i18n";

export default async function VaultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const payload = await readJson<{ vaults: Array<{ id: string; name: string; defaultCurrency: string }> }>(
    await apiFetch("/v1/vaults")
  );

  return (
    <div className="split">
      <section className="content-card stack">
        <p className="eyebrow">Your vaults</p>
        <div className="list">
          {payload.vaults.map((vault) => (
            <Link key={vault.id} href={`/${locale}/vaults/${vault.id}`} className="item-card">
              <strong>{vault.name}</strong>
              <span className="muted">{vault.defaultCurrency}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="form-card stack">
        <p className="eyebrow">New vault</p>
        <form className="form" action={createVaultAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="name">Vault name</label>
            <input id="name" name="name" required />
          </div>
          <button type="submit">Create vault</button>
        </form>
      </section>
    </div>
  );
}

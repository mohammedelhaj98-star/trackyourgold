import Link from "next/link";
import { notFound } from "next/navigation";

import { createVaultAction } from "../../../lib/actions";
import { apiFetch, readJson } from "../../../lib/api";
import { requireUser } from "../../../lib/auth";
import { isLocale, messages } from "../../../lib/i18n";

export default async function VaultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const copy = messages[locale];
  const payload = await readJson<{ vaults: Array<{ id: string; name: string; defaultCurrency: string }> }>(
    await apiFetch("/v1/vaults")
  );

  return (
    <div className="split split--wide">
      <section className="content-card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.vaultsTitle}</p>
            <h1 className="section-title">{copy.vaultsTitle}</h1>
          </div>
          <span className="panel-chip">{payload.vaults.length}</span>
        </div>
        <p className="muted">{copy.vaultsIntro}</p>
        <div className="list list--rows">
          {payload.vaults.map((vault) => (
            <Link key={vault.id} href={`/${locale}/vaults/${vault.id}`} className="item-card item-card--row">
              <div className="row-main">
                <strong>{vault.name}</strong>
                <span className="muted">{vault.defaultCurrency}</span>
              </div>
              <div className="row-end">
                <span className="link-pill">{copy.manageVaults}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="form-card stack">
        <p className="eyebrow">{copy.newVault}</p>
        <h2 className="panel-title">{copy.newVault}</h2>
        <p className="muted">{copy.vaultsIntro}</p>
        <form className="form" action={createVaultAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="field">
            <label htmlFor="name">{copy.vaultName}</label>
            <input id="name" name="name" required />
          </div>
          <button type="submit">{copy.createVault}</button>
        </form>
      </section>
    </div>
  );
}

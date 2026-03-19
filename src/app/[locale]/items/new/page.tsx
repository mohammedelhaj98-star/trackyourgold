import { notFound } from "next/navigation";

import { HoldingForm } from "../../../../components/holding-form";
import { createItemAction } from "../../../../lib/actions";
import { requireUser } from "../../../../lib/auth";
import { isLocale, messages } from "../../../../lib/i18n";
import { loadPortfolioState } from "../../../../lib/portfolio";

export default async function NewItemPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vaultId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const me = await requireUser(locale);
  const copy = messages[locale];
  const { vaultId } = await searchParams;
  const { vaults, marketRates, summary } = await loadPortfolioState();
  const selectedVaultId = vaultId ?? me.defaultVaultId ?? vaults[0]?.id ?? "";

  return (
    <div className="stack stack--page">
      <HoldingForm
        locale={locale}
        copy={copy}
        submitLabel={copy.addGold.save}
        action={createItemAction}
        vaultOptions={vaults.map((vault) => ({ id: vault.id, name: vault.name }))}
        live24kQar={marketRates.pricesByKarat["24K"] ?? 0}
        currentFineGoldGrams={summary.fineGoldGrams}
        values={{
          vaultId: selectedVaultId,
          itemName: "",
          grams: 0,
          karat: 22,
          purchaseBasisEnabled: false,
          purchasePriceMode: "total",
          purchasePriceValue: "",
          purchaseDate: "",
          tags: [],
          notes: ""
        }}
      />
    </div>
  );
}

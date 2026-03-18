import { notFound } from "next/navigation";

import { createItemAction } from "../../../../lib/actions";
import { requireUser } from "../../../../lib/auth";
import { isLocale } from "../../../../lib/i18n";

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

  await requireUser(locale);
  const { vaultId = "" } = await searchParams;

  return (
    <section className="form-card stack">
      <p className="eyebrow">Add item</p>
      <form className="form" action={createItemAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="vaultId" value={vaultId} />
        <div className="field"><label htmlFor="itemName">Item name</label><input id="itemName" name="itemName" required /></div>
        <div className="split">
          <div className="field"><label htmlFor="category">Category</label><select id="category" name="category"><option value="JEWELRY">Jewelry</option><option value="COIN">Coin</option><option value="BAR">Bar</option><option value="SCRAP">Scrap</option><option value="OTHER">Other</option></select></div>
          <div className="field"><label htmlFor="purityKarat">Karat</label><select id="purityKarat" name="purityKarat">{[24,23,22,21,18,14,12,10,9,8].map((value) => <option key={value} value={value}>{value}K</option>)}</select></div>
        </div>
        <div className="split">
          <div className="field"><label htmlFor="grossWeightG">Gross weight (g)</label><input id="grossWeightG" name="grossWeightG" type="number" step="0.0001" required /></div>
          <div className="field"><label htmlFor="stoneWeightG">Stone weight (g)</label><input id="stoneWeightG" name="stoneWeightG" type="number" step="0.0001" defaultValue="0" /></div>
        </div>
        <div className="split">
          <div className="field"><label htmlFor="purchaseDate">Purchase date</label><input id="purchaseDate" name="purchaseDate" type="date" required /></div>
          <div className="field"><label htmlFor="purchaseTotalPriceQar">Purchase total (QAR)</label><input id="purchaseTotalPriceQar" name="purchaseTotalPriceQar" type="number" step="0.01" required /></div>
        </div>
        <div className="split">
          <div className="field"><label htmlFor="makingChargesQar">Making charges</label><input id="makingChargesQar" name="makingChargesQar" type="number" step="0.01" defaultValue="0" /></div>
          <div className="field"><label htmlFor="vatQar">VAT</label><input id="vatQar" name="vatQar" type="number" step="0.01" defaultValue="0" /></div>
        </div>
        <div className="field"><label htmlFor="purchaseStoreName">Store</label><input id="purchaseStoreName" name="purchaseStoreName" /></div>
        <div className="field"><label htmlFor="purchaseLocation">Location</label><input id="purchaseLocation" name="purchaseLocation" /></div>
        <div className="field"><label htmlFor="purchaseNotes">Notes</label><textarea id="purchaseNotes" name="purchaseNotes" /></div>
        <button type="submit">Save item</button>
      </form>
    </section>
  );
}

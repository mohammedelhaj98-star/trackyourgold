import { notFound } from "next/navigation";

import { deleteItemAction, updateItemAction } from "../../../../lib/actions";
import { requireUser } from "../../../../lib/auth";
import { apiFetch, readJson } from "../../../../lib/api";
import { currency } from "../../../../lib/format";
import { isLocale } from "../../../../lib/i18n";

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ locale: string; itemId: string }>;
}) {
  const { locale, itemId } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const item = await readJson<{
    item: {
      id: string;
      itemName: string;
      category: string;
      purityKarat: number;
      grossWeightG: number;
      stoneWeightG: number;
      purchaseDate: string;
      purchaseTotalPriceQar: number;
      makingChargesQar: number;
      vatQar: number;
      purchaseStoreName: string | null;
      purchaseLocation: string | null;
      purchaseNotes: string | null;
    };
  }>(await apiFetch(`/v1/items/${itemId}`));

  const boundUpdate = updateItemAction.bind(null, itemId, locale);
  const boundDelete = deleteItemAction.bind(null, itemId, locale);

  return (
    <div className="split">
      <section className="form-card stack">
        <p className="eyebrow">Item detail</p>
        <h1>{item.item.itemName}</h1>
        <p className="muted">Estimates vary by buyer and deductions.</p>
        <form className="form" action={boundUpdate}>
          <div className="field"><label htmlFor="itemName">Item name</label><input id="itemName" name="itemName" defaultValue={item.item.itemName} required /></div>
          <div className="split">
            <div className="field"><label htmlFor="category">Category</label><select id="category" name="category" defaultValue={item.item.category}><option value="JEWELRY">Jewelry</option><option value="COIN">Coin</option><option value="BAR">Bar</option><option value="SCRAP">Scrap</option><option value="OTHER">Other</option></select></div>
            <div className="field"><label htmlFor="purityKarat">Karat</label><select id="purityKarat" name="purityKarat" defaultValue={item.item.purityKarat}>{[24,23,22,21,18,14,12,10,9,8].map((value) => <option key={value} value={value}>{value}K</option>)}</select></div>
          </div>
          <div className="split">
            <div className="field"><label htmlFor="grossWeightG">Gross weight</label><input id="grossWeightG" name="grossWeightG" type="number" step="0.0001" defaultValue={item.item.grossWeightG} required /></div>
            <div className="field"><label htmlFor="stoneWeightG">Stone weight</label><input id="stoneWeightG" name="stoneWeightG" type="number" step="0.0001" defaultValue={item.item.stoneWeightG} /></div>
          </div>
          <div className="split">
            <div className="field"><label htmlFor="purchaseDate">Purchase date</label><input id="purchaseDate" name="purchaseDate" type="date" defaultValue={item.item.purchaseDate.slice(0, 10)} required /></div>
            <div className="field"><label htmlFor="purchaseTotalPriceQar">Purchase total</label><input id="purchaseTotalPriceQar" name="purchaseTotalPriceQar" type="number" step="0.01" defaultValue={item.item.purchaseTotalPriceQar} required /></div>
          </div>
          <div className="split">
            <div className="field"><label htmlFor="makingChargesQar">Making charges</label><input id="makingChargesQar" name="makingChargesQar" type="number" step="0.01" defaultValue={item.item.makingChargesQar} /></div>
            <div className="field"><label htmlFor="vatQar">VAT</label><input id="vatQar" name="vatQar" type="number" step="0.01" defaultValue={item.item.vatQar} /></div>
          </div>
          <div className="field"><label htmlFor="purchaseStoreName">Store</label><input id="purchaseStoreName" name="purchaseStoreName" defaultValue={item.item.purchaseStoreName ?? ""} /></div>
          <div className="field"><label htmlFor="purchaseLocation">Location</label><input id="purchaseLocation" name="purchaseLocation" defaultValue={item.item.purchaseLocation ?? ""} /></div>
          <div className="field"><label htmlFor="purchaseNotes">Notes</label><textarea id="purchaseNotes" name="purchaseNotes" defaultValue={item.item.purchaseNotes ?? ""} /></div>
          <div className="button-row">
            <button type="submit">Save changes</button>
            <button type="button" className="button button--ghost" formAction={boundDelete}>
              Delete item
            </button>
          </div>
        </form>
      </section>
      <section className="content-card stack">
        <p className="eyebrow">Snapshot</p>
        <div className="metric-card stack">
          <span className="muted">Purchase total</span>
          <h2 className="metric-value">{currency(item.item.purchaseTotalPriceQar)}</h2>
        </div>
        <div className="notice">Category: {item.item.category} · {item.item.purityKarat}K</div>
      </section>
    </div>
  );
}

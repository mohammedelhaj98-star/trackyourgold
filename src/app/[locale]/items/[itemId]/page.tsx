import { notFound } from "next/navigation";

import { deleteItemAction, updateItemAction } from "../../../../lib/actions";
import { apiFetch, readJson } from "../../../../lib/api";
import { requireUser } from "../../../../lib/auth";
import { currency } from "../../../../lib/format";
import { isLocale, messages } from "../../../../lib/i18n";

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
  const copy = messages[locale];
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
    <div className="split split--wide">
      <section className="form-card stack">
        <p className="eyebrow">{copy.itemDetail}</p>
        <h1 className="section-title">{item.item.itemName}</h1>
        <p className="muted">{copy.itemDetailIntro}</p>
        <form className="form" action={boundUpdate}>
          <div className="field">
            <label htmlFor="itemName">Item name</label>
            <input id="itemName" name="itemName" defaultValue={item.item.itemName} required />
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="category">{copy.category}</label>
              <select id="category" name="category" defaultValue={item.item.category}>
                <option value="JEWELRY">Jewelry</option>
                <option value="COIN">Coin</option>
                <option value="BAR">Bar</option>
                <option value="SCRAP">Scrap</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="purityKarat">{copy.karat}</label>
              <select id="purityKarat" name="purityKarat" defaultValue={item.item.purityKarat}>
                {[24, 23, 22, 21, 18, 14, 12, 10, 9, 8].map((value) => (
                  <option key={value} value={value}>
                    {value}K
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="grossWeightG">{copy.grossWeight}</label>
              <input id="grossWeightG" name="grossWeightG" type="number" step="0.0001" defaultValue={item.item.grossWeightG} required />
            </div>
            <div className="field">
              <label htmlFor="stoneWeightG">{copy.stoneWeight}</label>
              <input id="stoneWeightG" name="stoneWeightG" type="number" step="0.0001" defaultValue={item.item.stoneWeightG} />
            </div>
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="purchaseDate">{copy.purchaseDate}</label>
              <input id="purchaseDate" name="purchaseDate" type="date" defaultValue={item.item.purchaseDate.slice(0, 10)} required />
            </div>
            <div className="field">
              <label htmlFor="purchaseTotalPriceQar">{copy.purchaseTotal}</label>
              <input
                id="purchaseTotalPriceQar"
                name="purchaseTotalPriceQar"
                type="number"
                step="0.01"
                defaultValue={item.item.purchaseTotalPriceQar}
                required
              />
            </div>
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="makingChargesQar">{copy.makingCharges}</label>
              <input id="makingChargesQar" name="makingChargesQar" type="number" step="0.01" defaultValue={item.item.makingChargesQar} />
            </div>
            <div className="field">
              <label htmlFor="vatQar">{copy.vat}</label>
              <input id="vatQar" name="vatQar" type="number" step="0.01" defaultValue={item.item.vatQar} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="purchaseStoreName">{copy.store}</label>
            <input id="purchaseStoreName" name="purchaseStoreName" defaultValue={item.item.purchaseStoreName ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="purchaseLocation">{copy.location}</label>
            <input id="purchaseLocation" name="purchaseLocation" defaultValue={item.item.purchaseLocation ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="purchaseNotes">{copy.notes}</label>
            <textarea id="purchaseNotes" name="purchaseNotes" defaultValue={item.item.purchaseNotes ?? ""} />
          </div>
          <div className="button-row">
            <button type="submit">{copy.saveChanges}</button>
            <button type="button" className="button button--ghost" formAction={boundDelete}>
              {copy.deleteItem}
            </button>
          </div>
        </form>
      </section>

      <section className="content-card stack">
        <p className="eyebrow">{copy.snapshot}</p>
        <div className="metric-card metric-card--soft stack">
          <span className="muted">{copy.purchaseTotal}</span>
          <h2 className="metric-value">{currency(item.item.purchaseTotalPriceQar, locale)}</h2>
        </div>
        <div className="notice">
          {copy.purchaseContext}: {item.item.category} · {item.item.purityKarat}K
        </div>
      </section>
    </div>
  );
}

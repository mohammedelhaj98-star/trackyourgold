import { notFound } from "next/navigation";

import { createItemAction } from "../../../../lib/actions";
import { requireUser } from "../../../../lib/auth";
import { isLocale, messages } from "../../../../lib/i18n";

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
  const copy = messages[locale];
  const { vaultId = "" } = await searchParams;

  return (
    <div className="split split--wide">
      <section className="form-card stack">
        <p className="eyebrow">{copy.addItemTitle}</p>
        <h1 className="section-title">{copy.addItemTitle}</h1>
        <p className="muted">{copy.addItemIntro}</p>
        <form className="form" action={createItemAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="vaultId" value={vaultId} />
          <div className="field">
            <label htmlFor="itemName">Item name</label>
            <input id="itemName" name="itemName" required />
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="category">{copy.category}</label>
              <select id="category" name="category">
                <option value="JEWELRY">Jewelry</option>
                <option value="COIN">Coin</option>
                <option value="BAR">Bar</option>
                <option value="SCRAP">Scrap</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="purityKarat">{copy.karat}</label>
              <select id="purityKarat" name="purityKarat">
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
              <input id="grossWeightG" name="grossWeightG" type="number" step="0.0001" required />
            </div>
            <div className="field">
              <label htmlFor="stoneWeightG">{copy.stoneWeight}</label>
              <input id="stoneWeightG" name="stoneWeightG" type="number" step="0.0001" defaultValue="0" />
            </div>
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="purchaseDate">{copy.purchaseDate}</label>
              <input id="purchaseDate" name="purchaseDate" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="purchaseTotalPriceQar">{copy.purchaseTotal}</label>
              <input id="purchaseTotalPriceQar" name="purchaseTotalPriceQar" type="number" step="0.01" required />
            </div>
          </div>
          <div className="split">
            <div className="field">
              <label htmlFor="makingChargesQar">{copy.makingCharges}</label>
              <input id="makingChargesQar" name="makingChargesQar" type="number" step="0.01" defaultValue="0" />
            </div>
            <div className="field">
              <label htmlFor="vatQar">{copy.vat}</label>
              <input id="vatQar" name="vatQar" type="number" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="purchaseStoreName">{copy.store}</label>
            <input id="purchaseStoreName" name="purchaseStoreName" />
          </div>
          <div className="field">
            <label htmlFor="purchaseLocation">{copy.location}</label>
            <input id="purchaseLocation" name="purchaseLocation" />
          </div>
          <div className="field">
            <label htmlFor="purchaseNotes">{copy.notes}</label>
            <textarea id="purchaseNotes" name="purchaseNotes" />
          </div>
          <button type="submit">{copy.saveItem}</button>
        </form>
      </section>

      <aside className="content-card stack">
        <p className="eyebrow">{copy.snapshot}</p>
        <h2 className="panel-title">{copy.purchaseContext}</h2>
        <p className="muted">{copy.addItemIntro}</p>
        <div className="notice">
          Store the gross weight, stone weight, and total paid once. The dashboard then keeps the valuation readable every day.
        </div>
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { formatNumber } from "../lib/format";
import { computeTierProgress, derivePriceFrom24k, getSuggestedTags } from "../lib/gold-utils";
import type { Locale, MessageCatalog } from "../lib/i18n";

type VaultOption = {
  id: string;
  name: string;
};

type HoldingFormValues = {
  vaultId: string;
  itemName: string;
  grams: number;
  karat: number;
  purchaseBasisEnabled: boolean;
  purchasePriceMode: "total" | "per_gram";
  purchasePriceValue: number | "";
  purchaseDate: string;
  tags: string[];
  notes: string;
};

type HoldingFormProps = {
  locale: Locale;
  copy: MessageCatalog;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  vaultOptions: VaultOption[];
  allowVaultChange?: boolean;
  live24kQar: number;
  currentFineGoldGrams: number;
  values: HoldingFormValues;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`button button--primary ${pending ? "button--loading" : ""}`}>
      {pending ? `${label}...` : label}
    </button>
  );
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function HoldingForm({
  locale,
  copy,
  submitLabel,
  action,
  vaultOptions,
  allowVaultChange = true,
  live24kQar,
  currentFineGoldGrams,
  values
}: HoldingFormProps) {
  const [vaultId, setVaultId] = useState(values.vaultId);
  const [itemName, setItemName] = useState(values.itemName);
  const [grams, setGrams] = useState(String(values.grams || ""));
  const [karat, setKarat] = useState(String(values.karat || 22));
  const [purchaseBasisEnabled, setPurchaseBasisEnabled] = useState(values.purchaseBasisEnabled);
  const [purchasePriceMode, setPurchasePriceMode] = useState<"total" | "per_gram">(values.purchasePriceMode);
  const [purchasePriceValue, setPurchasePriceValue] = useState<string>(
    values.purchasePriceValue === "" ? "" : String(values.purchasePriceValue)
  );
  const [purchaseDate, setPurchaseDate] = useState(values.purchaseDate);
  const [notes, setNotes] = useState(values.notes);
  const [selectedTags, setSelectedTags] = useState<string[]>(values.tags);

  const suggestedTags = getSuggestedTags();
  const gramsValue = Number(grams || 0);
  const karatValue = Number(karat || 22);
  const pricePerGram = live24kQar ? derivePriceFrom24k(live24kQar, karatValue) : 0;
  const worthNowQar = Number((gramsValue * pricePerGram).toFixed(2));
  const fineGoldAdded = Number((gramsValue * (karatValue / 24)).toFixed(4));
  const purchaseTotalQar =
    purchaseBasisEnabled && purchasePriceValue
      ? purchasePriceMode === "per_gram"
        ? Number((Number(purchasePriceValue) * gramsValue).toFixed(2))
        : Number(Number(purchasePriceValue).toFixed(2))
      : null;
  const gainLossQar = purchaseTotalQar !== null ? Number((worthNowQar - purchaseTotalQar).toFixed(2)) : null;
  const breakEvenPerGram =
    purchaseTotalQar !== null && gramsValue > 0 ? Number((purchaseTotalQar / gramsValue).toFixed(2)) : null;
  const tierPreview = computeTierProgress(currentFineGoldGrams + fineGoldAdded);
  const today = todayValue();

  const warnings = useMemo(() => {
    const nextWarnings: string[] = [];
    if (gramsValue <= 0) {
      nextWarnings.push(copy.addGold.validationGrams);
    }
    if (purchaseBasisEnabled && purchasePriceValue && Number(purchasePriceValue) <= 0) {
      nextWarnings.push(copy.addGold.validationPrice);
    }
    if (purchaseBasisEnabled && purchaseDate && purchaseDate > today) {
      nextWarnings.push(copy.addGold.validationFutureDate);
    }
    if (gramsValue > 5000) {
      nextWarnings.push(copy.addGold.validationWeightSoft);
    }
    return nextWarnings;
  }, [copy.addGold.validationFutureDate, copy.addGold.validationGrams, copy.addGold.validationPrice, copy.addGold.validationWeightSoft, gramsValue, purchaseBasisEnabled, purchaseDate, purchasePriceValue, today]);

  const tagCsv = selectedTags.join(",");

  return (
    <form className="holding-form" action={action}>
      <input type="hidden" name="vaultId" value={vaultId} />
      <input type="hidden" name="itemName" value={itemName} />
      <input type="hidden" name="grossWeightG" value={gramsValue > 0 ? String(gramsValue) : "0"} />
      <input type="hidden" name="stoneWeightG" value="0" />
      <input type="hidden" name="purityKarat" value={String(karatValue)} />
      <input type="hidden" name="purchaseBasisEnabled" value={String(purchaseBasisEnabled)} />
      <input type="hidden" name="purchasePriceMode" value={purchasePriceMode} />
      <input type="hidden" name="purchasePriceValue" value={purchasePriceValue} />
      <input type="hidden" name="purchaseDate" value={purchaseDate} />
      <input type="hidden" name="tags" value={tagCsv} />
      <input type="hidden" name="purchaseNotes" value={notes} />

      <div className="holding-form__layout">
        <section className="form-card form-card--sheet stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.addGold.title}</p>
              <h1 className="section-title">{copy.addGold.title}</h1>
            </div>
          </div>
          <p className="muted">{copy.addGold.intro}</p>

          <div className="field">
            <label htmlFor="vault">{copy.portfolio.vaultsCardTitle}</label>
            <select
              id="vault"
              name="vault"
              value={vaultId}
              onChange={(event) => setVaultId(event.target.value)}
              disabled={!allowVaultChange}
            >
              {vaultOptions.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="label">{copy.addGold.label}</label>
            <input
              id="label"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder={copy.addGold.labelPlaceholder}
              maxLength={120}
            />
          </div>

          <div className="split">
            <div className="field">
              <label htmlFor="grams">{copy.addGold.grams}</label>
              <input
                id="grams"
                name="grams"
                type="number"
                min="0"
                step="0.0001"
                inputMode="decimal"
                value={grams}
                onChange={(event) => setGrams(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="karat">{copy.addGold.karat}</label>
              <select id="karat" value={karat} onChange={(event) => setKarat(event.target.value)}>
                {[24, 23, 22, 21, 18, 14, 12, 10, 9, 8].map((value) => (
                  <option key={value} value={value}>
                    {value}K
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="toggle-card">
            <div className="toggle-card__copy">
              <strong>{copy.addGold.addPurchaseBasis}</strong>
              <p className="muted">{copy.addGold.purchaseOptionalCopy}</p>
            </div>
            <button
              type="button"
              className={`toggle ${purchaseBasisEnabled ? "toggle--active" : ""}`}
              aria-pressed={purchaseBasisEnabled}
              onClick={() => setPurchaseBasisEnabled((value) => !value)}
            >
              <span className="toggle__thumb" />
            </button>
          </div>

          {purchaseBasisEnabled ? (
            <div className="stack">
              <div className="segmented-control" role="tablist" aria-label={copy.addGold.purchasePriceMode}>
                {(["total", "per_gram"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`segmented-control__item ${purchasePriceMode === mode ? "segmented-control__item--active" : ""}`}
                    onClick={() => setPurchasePriceMode(mode)}
                  >
                    {mode === "total" ? copy.addGold.totalPrice : copy.addGold.perGramPrice}
                  </button>
                ))}
              </div>

              <div className="split">
                <div className="field">
                  <label htmlFor="purchasePrice">{copy.addGold.purchasePrice}</label>
                  <input
                    id="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={purchasePriceValue}
                    onChange={(event) => setPurchasePriceValue(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="purchaseDate">{copy.addGold.purchaseDate}</label>
                  <input
                    id="purchaseDate"
                    type="date"
                    value={purchaseDate}
                    max={today}
                    onChange={(event) => setPurchaseDate(event.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="field">
            <label>{copy.addGold.tags}</label>
            <div className="chip-grid">
              {suggestedTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip ${selected ? "tag-chip--active" : ""}`}
                    onClick={() =>
                      setSelectedTags((current) =>
                        current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
                      )
                    }
                  >
                    {copy.tags[tag]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">{copy.addGold.notes}</label>
            <textarea
              id="notes"
              maxLength={240}
              placeholder={copy.addGold.notesPlaceholder}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {warnings.length ? (
            <div className="notice notice--warning">
              {warnings.map((warning) => (
                <span key={warning}>{warning}</span>
              ))}
            </div>
          ) : null}

          <SubmitButton label={submitLabel} />
        </section>

        <aside className="content-card content-card--sticky stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.addGold.instantPanel}</p>
              <h2 className="panel-title">{copy.addGold.instantPanel}</h2>
            </div>
          </div>

          <div className="metric-card metric-card--spotlight stack">
            <span className="muted">{copy.common.worthNow}</span>
            <strong className="metric-value">{formatNumber(worthNowQar, locale, 2)}</strong>
          </div>

          <div className="list list--rows">
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.addGold.fineGoldAdded}</strong>
              </div>
              <div className="row-end">
                <span>{formatNumber(fineGoldAdded, locale, 4)}g</span>
              </div>
            </div>
            <div className="item-card item-card--row">
              <div className="row-main">
                <strong>{copy.common.live22k}</strong>
              </div>
              <div className="row-end">
                <span>{formatNumber(derivePriceFrom24k(live24kQar, 22), locale, 2)}</span>
              </div>
            </div>
            {gainLossQar !== null ? (
              <>
                <div className="item-card item-card--row">
                  <div className="row-main">
                    <strong>{copy.common.gainLoss}</strong>
                  </div>
                  <div className="row-end">
                    <span className={gainLossQar >= 0 ? "status-good" : "status-bad"}>
                      {formatNumber(gainLossQar, locale, 2)}
                    </span>
                  </div>
                </div>
                <div className="item-card item-card--row">
                  <div className="row-main">
                    <strong>{copy.addGold.breakEven}</strong>
                  </div>
                  <div className="row-end">
                    <span>{breakEvenPerGram !== null ? formatNumber(breakEvenPerGram, locale, 2) : "—"}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="progress-preview">
            <div className="progress-preview__header">
              <strong>{copy.addGold.progressToNextTier}</strong>
              <span>
                {formatNumber(tierPreview.gramsToNextTier, locale, 2)}
                g
              </span>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${tierPreview.tierProgressPct}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

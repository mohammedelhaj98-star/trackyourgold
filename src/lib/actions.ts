"use server";

import { redirect } from "next/navigation";

import { clearSession, setSession } from "./auth";
import { apiFetch, readJson } from "./api";
import { inferCategory, inferHoldingName, parseTags, serializeHoldingNotes } from "./portfolio";
import { saveUiPreferences } from "./preferences";

function toText(formData: FormData, key: string, fallback = "") {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : fallback;
}

function toNumber(formData: FormData, key: string, fallback = 0) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.length === 0) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(formData: FormData, key: string, fallback = false) {
  const raw = toText(formData, key, String(fallback));
  return raw === "true";
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function buildVaultItemPayload(formData: FormData) {
  const grams = toNumber(formData, "grossWeightG");
  const karat = toNumber(formData, "purityKarat", 22);
  const tags = parseTags(toText(formData, "tags"));
  const purchaseBasisEnabled = toBoolean(formData, "purchaseBasisEnabled", false);
  const purchasePriceMode = toText(formData, "purchasePriceMode", "total") === "per_gram" ? "per_gram" : "total";
  const purchasePriceValue = toNumber(formData, "purchasePriceValue");
  const purchaseDateInput = toText(formData, "purchaseDate");
  const purchaseDateProvided = purchaseBasisEnabled && purchaseDateInput.length > 0;
  const purchaseTotalPriceQar = purchaseBasisEnabled
    ? purchasePriceMode === "per_gram"
      ? purchasePriceValue * grams
      : purchasePriceValue
    : 0.01;

  return {
    itemName: inferHoldingName(toText(formData, "itemName"), grams, karat, tags),
    category: inferCategory(tags),
    purityKarat: karat,
    grossWeightG: grams,
    stoneWeightG: 0,
    purchaseDate: purchaseDateProvided ? purchaseDateInput : todayValue(),
    purchaseTotalPriceQar: Math.max(Number(purchaseTotalPriceQar.toFixed(2)), 0.01),
    makingChargesQar: 0,
    vatQar: 0,
    purchaseStoreName: "",
    purchaseLocation: "",
    purchaseNotes: serializeHoldingNotes({
      tags,
      purchaseBasis: purchaseBasisEnabled ? "known" : "none",
      purchasePriceMode,
      purchaseDateProvided,
      notes: toText(formData, "purchaseNotes")
    })
  };
}

export async function signupAction(formData: FormData) {
  const locale = toText(formData, "locale", "en");
  const response = await apiFetch("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: toText(formData, "email"),
      password: toText(formData, "password"),
      language: locale
    })
  });

  const payload = await readJson<{
    user: { id: string; email: string; language: string };
    session: { accessToken: string; refreshToken: string };
  }>(response);

  await setSession(payload.session);
  redirect(`/${locale}`);
}

export async function loginAction(formData: FormData) {
  const locale = toText(formData, "locale", "en");
  const response = await apiFetch("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: toText(formData, "email"),
      password: toText(formData, "password")
    })
  });

  const payload = await readJson<{
    user: { id: string; email: string; language: string };
    session: { accessToken: string; refreshToken: string };
  }>(response);

  await setSession(payload.session);
  redirect(`/${locale}`);
}

export async function logoutAction(locale: string) {
  try {
    await apiFetch("/v1/auth/logout", {
      method: "POST"
    });
  } finally {
    await clearSession();
  }

  redirect(`/${locale}`);
}

export async function createVaultAction(formData: FormData) {
  const locale = toText(formData, "locale", "en");
  const response = await apiFetch("/v1/vaults", {
    method: "POST",
    body: JSON.stringify({
      name: toText(formData, "name")
    })
  });

  const payload = await readJson<{ vault: { id: string } }>(response);
  redirect(`/${locale}/vaults/${payload.vault.id}`);
}

export async function createItemAction(formData: FormData) {
  const locale = toText(formData, "locale", "en");
  const vaultId = toText(formData, "vaultId");

  await readJson(
    await apiFetch(`/v1/vaults/${vaultId}/items`, {
      method: "POST",
      body: JSON.stringify(buildVaultItemPayload(formData))
    })
  );

  redirect(`/${locale}?added=1`);
}

export async function updateItemAction(itemId: string, locale: string, formData: FormData) {
  await readJson(
    await apiFetch(`/v1/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(buildVaultItemPayload(formData))
    })
  );

  redirect(`/${locale}/items/${itemId}?saved=1`);
}

export async function deleteItemAction(itemId: string, locale: string) {
  await apiFetch(`/v1/items/${itemId}`, {
    method: "DELETE"
  });
  redirect(`/${locale}/vaults?deleted=1`);
}

export async function savePreferencesAction(locale: string, formData: FormData) {
  await saveUiPreferences({
    showRetailComparison: toBoolean(formData, "showRetailComparison", true),
    showGainLossWhenBasisExists: toBoolean(formData, "showGainLossWhenBasisExists", true),
    reduceMotion: toBoolean(formData, "reduceMotion", false)
  });

  redirect(`/${locale}/settings?saved=1` as never);
}

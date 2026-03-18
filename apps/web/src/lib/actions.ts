"use server";

import { redirect } from "next/navigation";

import { apiFetch, readJson } from "./api";
import { clearSession, setSession } from "./auth";

function toText(formData: FormData, key: string, fallback = "") {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : fallback;
}

function toNumber(formData: FormData, key: string, fallback = 0) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.length === 0) {
    return fallback;
  }
  return Number(raw);
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
  redirect(`/${locale}/dashboard`);
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
  redirect(`/${locale}/dashboard`);
}

export async function logoutAction(locale: string) {
  await apiFetch("/v1/auth/logout", {
    method: "POST"
  });
  await clearSession();
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
  const response = await apiFetch(`/v1/vaults/${vaultId}/items`, {
    method: "POST",
    body: JSON.stringify({
      itemName: toText(formData, "itemName"),
      category: toText(formData, "category", "JEWELRY"),
      purityKarat: toNumber(formData, "purityKarat", 22),
      grossWeightG: toNumber(formData, "grossWeightG"),
      stoneWeightG: toNumber(formData, "stoneWeightG"),
      purchaseDate: toText(formData, "purchaseDate"),
      purchaseTotalPriceQar: toNumber(formData, "purchaseTotalPriceQar"),
      makingChargesQar: toNumber(formData, "makingChargesQar"),
      vatQar: toNumber(formData, "vatQar"),
      purchaseStoreName: toText(formData, "purchaseStoreName"),
      purchaseLocation: toText(formData, "purchaseLocation"),
      purchaseNotes: toText(formData, "purchaseNotes")
    })
  });

  await readJson(response);
  redirect(`/${locale}/vaults/${vaultId}`);
}

export async function updateItemAction(itemId: string, locale: string, formData: FormData) {
  await apiFetch(`/v1/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      itemName: toText(formData, "itemName"),
      category: toText(formData, "category", "JEWELRY"),
      purityKarat: toNumber(formData, "purityKarat", 22),
      grossWeightG: toNumber(formData, "grossWeightG"),
      stoneWeightG: toNumber(formData, "stoneWeightG"),
      purchaseDate: toText(formData, "purchaseDate"),
      purchaseTotalPriceQar: toNumber(formData, "purchaseTotalPriceQar"),
      makingChargesQar: toNumber(formData, "makingChargesQar"),
      vatQar: toNumber(formData, "vatQar"),
      purchaseStoreName: toText(formData, "purchaseStoreName"),
      purchaseLocation: toText(formData, "purchaseLocation"),
      purchaseNotes: toText(formData, "purchaseNotes")
    })
  });

  redirect(`/${locale}/items/${itemId}`);
}

export async function deleteItemAction(itemId: string, locale: string) {
  await apiFetch(`/v1/items/${itemId}`, {
    method: "DELETE"
  });
  redirect(`/${locale}/dashboard`);
}

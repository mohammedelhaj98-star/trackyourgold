import { redirect } from "next/navigation";

import { apiFetch, readJson } from "./api";
import type { Locale } from "./i18n";

export type AdminSession = {
  user: {
    id: string;
    username: string | null;
    email: string;
    language: string;
    role: string;
  };
};

export async function getCurrentAdmin() {
  const response = await apiFetch("/v1/admin/me");
  if (response.status === 401 || response.status === 403) {
    return null;
  }

  return readJson<AdminSession>(response);
}

export async function requireAdmin(locale: Locale) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect(`/${locale}/admin/login`);
  }

  return admin;
}

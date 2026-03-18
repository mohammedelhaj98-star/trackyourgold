import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiFetch, readJson } from "./api";

const ACCESS_COOKIE = "tyg_access_token";
const REFRESH_COOKIE = "tyg_refresh_token";

type SessionResponse = {
  user: { id: string; email: string; language: string };
  session: { accessToken: string; refreshToken: string };
};

export async function setSession(session: SessionResponse["session"]) {
  const store = await cookies();
  for (const [name, value] of [
    [ACCESS_COOKIE, session.accessToken],
    [REFRESH_COOKIE, session.refreshToken]
  ] as const) {
    store.set(name, value, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    });
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getCurrentUser() {
  const response = await apiFetch("/v1/me");
  if (response.status === 401) {
    return null;
  }
  return readJson<{ user: { id: string; email: string; language: string }; defaultVaultId: string | null }>(response);
}

export async function requireUser(locale: string) {
  const me = await getCurrentUser();
  if (!me) {
    redirect(`/${locale}/login`);
  }
  return me;
}

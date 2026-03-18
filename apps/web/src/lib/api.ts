import { cookies } from "next/headers";

const ACCESS_COOKIE = "tyg_access_token";
const REFRESH_COOKIE = "tyg_refresh_token";

function resolveBaseUrl(baseUrl = process.env.API_BASE_URL ?? "localhost:4000") {
  if (baseUrl.includes("//")) {
    return baseUrl;
  }

  const scheme = baseUrl.includes("localhost") ? "http:" : "https:";
  return `${scheme}//${baseUrl}`;
}

function serializeAuthCookies(accessToken?: string, refreshToken?: string) {
  const pairs = [];
  if (accessToken) {
    pairs.push(`${ACCESS_COOKIE}=${accessToken}`);
  }
  if (refreshToken) {
    pairs.push(`${REFRESH_COOKIE}=${refreshToken}`);
  }
  return pairs.join("; ");
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const headers = new Headers(init.headers);

  const authCookies = serializeAuthCookies(accessToken, refreshToken);
  if (authCookies) {
    headers.set("cookie", authCookies);
  }

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}

export async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) {
    const message = payload.error?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload;
}

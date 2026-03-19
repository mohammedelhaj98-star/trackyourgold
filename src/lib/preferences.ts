import { cookies } from "next/headers";

export type UiPreferences = {
  currency: "QAR";
  showRetailComparison: boolean;
  showGainLossWhenBasisExists: boolean;
  reduceMotion: boolean;
};

const COOKIE_NAMES = {
  showRetailComparison: "tyg_pref_retail",
  showGainLossWhenBasisExists: "tyg_pref_gain_loss",
  reduceMotion: "tyg_pref_reduce_motion"
} as const;

export const DEFAULT_PREFERENCES: UiPreferences = {
  currency: "QAR",
  showRetailComparison: true,
  showGainLossWhenBasisExists: true,
  reduceMotion: false
};

function readBooleanCookie(value: string | undefined, fallback: boolean) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

export async function getUiPreferences(): Promise<UiPreferences> {
  const store = await cookies();

  return {
    currency: "QAR",
    showRetailComparison: readBooleanCookie(
      store.get(COOKIE_NAMES.showRetailComparison)?.value,
      DEFAULT_PREFERENCES.showRetailComparison
    ),
    showGainLossWhenBasisExists: readBooleanCookie(
      store.get(COOKIE_NAMES.showGainLossWhenBasisExists)?.value,
      DEFAULT_PREFERENCES.showGainLossWhenBasisExists
    ),
    reduceMotion: readBooleanCookie(store.get(COOKIE_NAMES.reduceMotion)?.value, DEFAULT_PREFERENCES.reduceMotion)
  };
}

export async function saveUiPreferences(input: Partial<UiPreferences>) {
  const store = await cookies();

  if (typeof input.showRetailComparison === "boolean") {
    store.set(COOKIE_NAMES.showRetailComparison, String(input.showRetailComparison), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }

  if (typeof input.showGainLossWhenBasisExists === "boolean") {
    store.set(COOKIE_NAMES.showGainLossWhenBasisExists, String(input.showGainLossWhenBasisExists), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }

  if (typeof input.reduceMotion === "boolean") {
    store.set(COOKIE_NAMES.reduceMotion, String(input.reduceMotion), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }
}

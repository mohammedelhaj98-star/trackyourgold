import { cache } from "react";

import { apiFetch, readJson } from "./api";
import { messages, type Locale, type MessageCatalog } from "./i18n";

export type LocalizedValue = {
  en: string;
  ar: string;
};

export type LocalizedTree = {
  [key: string]: LocalizedTree | LocalizedValue;
};

export type UiThemeConfig = {
  accentColor: string;
  softAccentColor: string;
  heroGradientStart: string;
  heroGradientEnd: string;
};

export type UiHomeSectionId = "chart" | "market" | "recentHoldings" | "achievements";

export type UiHomeLayoutConfig = {
  sectionVisibility: Record<UiHomeSectionId, boolean>;
  sectionOrder: UiHomeSectionId[];
};

export type UiAdsConfig = {
  label: LocalizedValue;
  home: {
    enabled: boolean;
    title: LocalizedValue;
    copy: LocalizedValue;
  };
  portfolio: {
    enabled: boolean;
    title: LocalizedValue;
    copy: LocalizedValue;
  };
  settings: {
    enabled: boolean;
    title: LocalizedValue;
    copy: LocalizedValue;
  };
};

export type UiConfig = {
  theme: UiThemeConfig;
  brand: LocalizedTree;
  nav: LocalizedTree;
  common: LocalizedTree;
  hero: LocalizedTree;
  home: LocalizedTree;
  portfolio: LocalizedTree;
  addGold: LocalizedTree;
  holding: LocalizedTree;
  progress: LocalizedTree;
  settings: LocalizedTree;
  auth: LocalizedTree;
  achievements: LocalizedTree;
  tags: LocalizedTree;
  categories: LocalizedTree;
  homeLayout: UiHomeLayoutConfig;
  ads: UiAdsConfig;
};

const DEFAULT_THEME: UiThemeConfig = {
  accentColor: "#efc97d",
  softAccentColor: "#b88a39",
  heroGradientStart: "#efc97d",
  heroGradientEnd: "#7f96ff"
};

const DEFAULT_HOME_LAYOUT: UiHomeLayoutConfig = {
  sectionVisibility: {
    chart: true,
    market: true,
    recentHoldings: true,
    achievements: true
  },
  sectionOrder: ["chart", "market", "recentHoldings", "achievements"]
};

const DEFAULT_ADS: UiAdsConfig = {
  label: {
    en: "Ad",
    ar: "إعلان"
  },
  home: {
    enabled: true,
    title: {
      en: "Low-profile sponsor slot",
      ar: "موضع راعٍ هادئ"
    },
    copy: {
      en: "A quiet placement for a partner card, clearly marked and never blended into navigation.",
      ar: "مساحة هادئة لبطاقة شريك مع توضيح كامل ومن دون تشابه مع عناصر التنقل."
    }
  },
  portfolio: {
    enabled: true,
    title: {
      en: "Subtle sponsor card",
      ar: "بطاقة راعٍ هادئة"
    },
    copy: {
      en: "Reserved for a clearly marked ad that never imitates actions or navigation.",
      ar: "مخصصة لإعلان واضح التمييز لا يقلد الأزرار أو عناصر التنقل."
    }
  },
  settings: {
    enabled: false,
    title: {
      en: "Quiet sponsor placement",
      ar: "موضع راعٍ هادئ"
    },
    copy: {
      en: "Reserved for a clearly labeled partner card that never imitates navigation.",
      ar: "مساحة مخصصة لشريك واضح التسمية لا يشبه عناصر التنقل."
    }
  }
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalizedValue(value: unknown): value is LocalizedValue {
  return isObject(value) && typeof value.en === "string" && typeof value.ar === "string";
}

function toLeafText(value: unknown) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

function buildLocalizedTree(enValue: unknown, arValue: unknown): LocalizedTree | LocalizedValue {
  if (typeof enValue === "string" && typeof arValue === "string") {
    return { en: enValue, ar: arValue };
  }

  if (!isObject(enValue) || !isObject(arValue)) {
    return { en: toLeafText(enValue), ar: toLeafText(arValue) };
  }

  const keys = [...new Set([...Object.keys(enValue), ...Object.keys(arValue)])];
  return Object.fromEntries(
    keys.map((key) => [key, buildLocalizedTree(enValue[key], arValue[key])])
  );
}

function mergeLocalizedTree<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) {
    return base;
  }

  if (isLocalizedValue(base) && isObject(override)) {
    return {
      en: typeof override.en === "string" ? override.en : base.en,
      ar: typeof override.ar === "string" ? override.ar : base.ar
    } as T;
  }

  if (Array.isArray(base) && Array.isArray(override)) {
    return override as T;
  }

  if (isObject(base) && isObject(override)) {
    const output: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override)) {
      output[key] = key in output ? mergeLocalizedTree(output[key], override[key]) : override[key];
    }
    return output as T;
  }

  return override as T;
}

function localizeTree(tree: unknown, locale: Locale): unknown {
  if (isLocalizedValue(tree)) {
    return tree[locale];
  }

  if (Array.isArray(tree)) {
    return tree.map((value) => localizeTree(value, locale));
  }

  if (isObject(tree)) {
    return Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, localizeTree(value, locale)]));
  }

  return tree;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildDefaultConfig(): UiConfig {
  return {
    theme: DEFAULT_THEME,
    brand: {
      brandTagline: buildLocalizedTree(messages.en.brandTagline, messages.ar.brandTagline),
      localeSwitch: buildLocalizedTree(messages.en.localeSwitch, messages.ar.localeSwitch)
    },
    nav: buildLocalizedTree(messages.en.nav, messages.ar.nav) as LocalizedTree,
    common: buildLocalizedTree(messages.en.common, messages.ar.common) as LocalizedTree,
    hero: buildLocalizedTree(messages.en.hero, messages.ar.hero) as LocalizedTree,
    home: buildLocalizedTree(messages.en.home, messages.ar.home) as LocalizedTree,
    portfolio: buildLocalizedTree(messages.en.portfolio, messages.ar.portfolio) as LocalizedTree,
    addGold: buildLocalizedTree(messages.en.addGold, messages.ar.addGold) as LocalizedTree,
    holding: buildLocalizedTree(messages.en.holding, messages.ar.holding) as LocalizedTree,
    progress: buildLocalizedTree(messages.en.progress, messages.ar.progress) as LocalizedTree,
    settings: buildLocalizedTree(messages.en.settings, messages.ar.settings) as LocalizedTree,
    auth: buildLocalizedTree(messages.en.auth, messages.ar.auth) as LocalizedTree,
    achievements: buildLocalizedTree(messages.en.achievements, messages.ar.achievements) as LocalizedTree,
    tags: buildLocalizedTree(messages.en.tags, messages.ar.tags) as LocalizedTree,
    categories: buildLocalizedTree(messages.en.categories, messages.ar.categories) as LocalizedTree,
    homeLayout: DEFAULT_HOME_LAYOUT,
    ads: DEFAULT_ADS
  };
}

export const defaultUiConfig = buildDefaultConfig();

export function mergeUiConfig(base: UiConfig, override?: Partial<UiConfig> | null): UiConfig {
  if (!override) {
    return base;
  }

  return {
    ...base,
    theme: mergeLocalizedTree(base.theme, override.theme),
    brand: mergeLocalizedTree(base.brand, override.brand),
    nav: mergeLocalizedTree(base.nav, override.nav),
    common: mergeLocalizedTree(base.common, override.common),
    hero: mergeLocalizedTree(base.hero, override.hero),
    home: mergeLocalizedTree(base.home, override.home),
    portfolio: mergeLocalizedTree(base.portfolio, override.portfolio),
    addGold: mergeLocalizedTree(base.addGold, override.addGold),
    holding: mergeLocalizedTree(base.holding, override.holding),
    progress: mergeLocalizedTree(base.progress, override.progress),
    settings: mergeLocalizedTree(base.settings, override.settings),
    auth: mergeLocalizedTree(base.auth, override.auth),
    achievements: mergeLocalizedTree(base.achievements, override.achievements),
    tags: mergeLocalizedTree(base.tags, override.tags),
    categories: mergeLocalizedTree(base.categories, override.categories),
    homeLayout: mergeLocalizedTree(base.homeLayout, override.homeLayout),
    ads: mergeLocalizedTree(base.ads, override.ads)
  };
}

const getResolvedUiConfig = cache(async () => {
  try {
    const response = await apiFetch("/v1/public/ui-config");
    if (!response.ok) {
      return defaultUiConfig;
    }

    const payload = await readJson<{ config: Partial<UiConfig> }>(response);
    return mergeUiConfig(defaultUiConfig, payload.config);
  } catch {
    return defaultUiConfig;
  }
});

export async function getRuntimeUi(locale: Locale) {
  const config = await getResolvedUiConfig();
  const brand = config.brand as { brandTagline: LocalizedValue; localeSwitch: LocalizedValue };
  const copy = {
    brandTagline: brand.brandTagline[locale],
    localeSwitch: brand.localeSwitch[locale],
    nav: localizeTree(config.nav, locale),
    common: localizeTree(config.common, locale),
    hero: localizeTree(config.hero, locale),
    home: localizeTree(config.home, locale),
    portfolio: localizeTree(config.portfolio, locale),
    addGold: localizeTree(config.addGold, locale),
    holding: localizeTree(config.holding, locale),
    progress: localizeTree(config.progress, locale),
    settings: localizeTree(config.settings, locale),
    auth: localizeTree(config.auth, locale),
    achievements: localizeTree(config.achievements, locale),
    tags: localizeTree(config.tags, locale),
    categories: localizeTree(config.categories, locale)
  } as unknown as MessageCatalog;

  return {
    config,
    copy,
    themeStyle: {
      "--gold": config.theme.accentColor,
      "--gold-deep": config.theme.accentColor,
      "--blue": config.theme.heroGradientEnd,
      "--accent-soft-color": hexToRgba(config.theme.softAccentColor, 0.14),
      "--accent-soft-color-strong": hexToRgba(config.theme.softAccentColor, 0.1),
      "--hero-gradient-start": hexToRgba(config.theme.heroGradientStart, 0.16),
      "--hero-gradient-end": hexToRgba(config.theme.heroGradientEnd, 0.16)
    } as Record<string, string>,
    homeSections: config.homeLayout.sectionOrder.filter((section) => config.homeLayout.sectionVisibility[section]),
    ads: {
      label: config.ads.label[locale],
      home: {
        enabled: config.ads.home.enabled,
        title: config.ads.home.title[locale],
        copy: config.ads.home.copy[locale]
      },
      portfolio: {
        enabled: config.ads.portfolio.enabled,
        title: config.ads.portfolio.title[locale],
        copy: config.ads.portfolio.copy[locale]
      },
      settings: {
        enabled: config.ads.settings.enabled,
        title: config.ads.settings.title[locale],
        copy: config.ads.settings.copy[locale]
      }
    }
  };
}

export async function getAdminUiConfig() {
  const response = await apiFetch("/v1/admin/ui-config");
  const payload = await readJson<{ config: Partial<UiConfig> }>(response);
  return mergeUiConfig(defaultUiConfig, payload.config);
}

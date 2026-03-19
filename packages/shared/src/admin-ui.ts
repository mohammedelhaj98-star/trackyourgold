import { z } from "zod";

export const UI_HOME_SECTION_IDS = ["chart", "market", "recentHoldings", "achievements"] as const;

export const UI_SETTING_KEYS = {
  theme: "ui.theme",
  brand: "ui.brand",
  nav: "ui.nav",
  common: "ui.common",
  hero: "ui.hero",
  home: "ui.home",
  portfolio: "ui.portfolio",
  addGold: "ui.add_gold",
  holding: "ui.holding",
  progress: "ui.progress",
  settings: "ui.settings",
  auth: "ui.auth",
  achievements: "ui.achievements",
  tags: "ui.tags",
  categories: "ui.categories",
  homeLayout: "ui.home_layout",
  ads: "ui.ads"
} as const;

export type UiSettingSection = keyof typeof UI_SETTING_KEYS;

const localizedStringSchema = z.object({
  en: z.string().trim().max(600),
  ar: z.string().trim().max(600)
});

type LocalizedTree = {
  [key: string]: LocalizedTree | z.infer<typeof localizedStringSchema>;
};

const localizedTreeSchema: z.ZodType<LocalizedTree> = z.lazy(() =>
  z.record(z.union([localizedStringSchema, localizedTreeSchema]))
);

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a 6-digit hex color.");

const sectionVisibilitySchema = z.object({
  chart: z.boolean(),
  market: z.boolean(),
  recentHoldings: z.boolean(),
  achievements: z.boolean()
});

const sectionOrderSchema = z
  .array(z.enum(UI_HOME_SECTION_IDS))
  .length(UI_HOME_SECTION_IDS.length)
  .superRefine((value, context) => {
    const unique = new Set(value);
    if (unique.size !== value.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Home section order must not contain duplicates."
      });
    }
  });

export const adminThemeSchema = z.object({
  accentColor: hexColorSchema,
  softAccentColor: hexColorSchema,
  heroGradientStart: hexColorSchema,
  heroGradientEnd: hexColorSchema
});

export const adminHomeLayoutSchema = z.object({
  sectionVisibility: sectionVisibilitySchema,
  sectionOrder: sectionOrderSchema
});

export const adminAdsSchema = z.object({
  label: localizedStringSchema,
  home: z.object({
    enabled: z.boolean(),
    title: localizedStringSchema,
    copy: localizedStringSchema
  }),
  portfolio: z.object({
    enabled: z.boolean(),
    title: localizedStringSchema,
    copy: localizedStringSchema
  }),
  settings: z.object({
    enabled: z.boolean(),
    title: localizedStringSchema,
    copy: localizedStringSchema
  })
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(120)
});

export const adminUiConfigSchema = z.object({
  theme: adminThemeSchema,
  brand: localizedTreeSchema,
  nav: localizedTreeSchema,
  common: localizedTreeSchema,
  hero: localizedTreeSchema,
  home: localizedTreeSchema,
  portfolio: localizedTreeSchema,
  addGold: localizedTreeSchema,
  holding: localizedTreeSchema,
  progress: localizedTreeSchema,
  settings: localizedTreeSchema,
  auth: localizedTreeSchema,
  achievements: localizedTreeSchema,
  tags: localizedTreeSchema,
  categories: localizedTreeSchema,
  homeLayout: adminHomeLayoutSchema,
  ads: adminAdsSchema
});

export type AdminUiConfig = z.infer<typeof adminUiConfigSchema>;
export type AdminThemeConfig = z.infer<typeof adminThemeSchema>;
export type AdminHomeLayoutConfig = z.infer<typeof adminHomeLayoutSchema>;
export type AdminAdsConfig = z.infer<typeof adminAdsSchema>;
export type AdminUiOverrideConfig = Partial<AdminUiConfig>;

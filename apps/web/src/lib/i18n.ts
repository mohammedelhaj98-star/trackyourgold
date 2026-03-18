export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const messages = {
  en: {
    heroTitle: "Track what your gold is worth today — piece by piece.",
    heroSubtitle: "A clean vault for your jewelry, coins, and bars. Live QAR estimates from market rates and local retail boards.",
    heroCta: "Create account",
    dashboardTitle: "Your Gold Today",
    totalValue: "Total value",
    invested: "Invested",
    profitLoss: "Profit/Loss",
    lastUpdated: "Last updated",
    sourcesTitle: "Source health"
  },
  ar: {
    heroTitle: "تابع قيمة ذهبك اليوم — قطعة بقطعة",
    heroSubtitle: "خزنة بسيطة لمجوهراتك وسبائكك وعملاتك. تقديرات بالريال القطري من أسعار السوق ولوحات المتاجر.",
    heroCta: "إنشاء حساب",
    dashboardTitle: "ذهبك اليوم",
    totalValue: "إجمالي القيمة",
    invested: "إجمالي الشراء",
    profitLoss: "الربح/الخسارة",
    lastUpdated: "آخر تحديث",
    sourcesTitle: "صحة المصادر"
  }
} as const;

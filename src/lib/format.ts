import type { Locale } from "./i18n";

function resolveIntlLocale(locale: Locale) {
  return locale === "ar" ? "ar-QA" : "en-QA";
}

export function currency(value: number, locale: Locale = "en") {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: "currency",
    currency: "QAR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string | Date, locale: Locale = "en") {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatPercent(value: number, locale: Locale = "en") {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

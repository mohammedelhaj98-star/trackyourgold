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

export function formatNumber(value: number, locale: Locale = "en", maximumFractionDigits = 2) {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    maximumFractionDigits
  }).format(value);
}

export function formatCompactNumber(value: number, locale: Locale = "en") {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    maximumFractionDigits: 1,
    notation: "compact"
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

export function formatSignedCurrency(value: number, locale: Locale = "en") {
  const formatted = currency(Math.abs(value), locale);
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

export function formatSignedPercent(value: number, locale: Locale = "en") {
  const formatted = formatPercent(Math.abs(value), locale);
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

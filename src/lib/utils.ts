import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function absoluteUrl(path = "/") {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export function formatQar(value: number | string, maximumFractionDigits = 2) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: "QAR",
    maximumFractionDigits
  }).format(numeric);
}

export function formatPercent(value: number, maximumFractionDigits = 2) {
  return `${value.toFixed(maximumFractionDigits)}%`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: Date | string, template = "MMM d, yyyy h:mm a") {
  return format(typeof value === "string" ? new Date(value) : value, template);
}

export function formatRelative(value: Date | string) {
  return formatDistanceToNow(typeof value === "string" ? new Date(value) : value, { addSuffix: true });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function decimalToNumber(value: { toString(): string } | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function percentChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function gramsFromTroyOunce(value: number) {
  return value / 31.1034768;
}

export function minutesToMs(minutes: number) {
  return minutes * 60 * 1000;
}

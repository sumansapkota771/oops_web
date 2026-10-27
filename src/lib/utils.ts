import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Nepali digit grouping, e.g. 120000 → "1,20,000". */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Today's date (YYYY-MM-DD) in Kathmandu. */
export function todayInNepal(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }).format(now);
}

export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Deep-merges stored JSON onto defaults so missing keys never crash a page. Arrays are replaced, not merged. */
export function withDefaults<T>(defaults: T, value: unknown): T {
  if (value === null || value === undefined) return defaults;
  if (Array.isArray(defaults) || typeof defaults !== "object" || defaults === null) {
    return (typeof value === typeof defaults || defaults === null ? value : defaults) as T;
  }
  if (typeof value !== "object" || Array.isArray(value)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const d = (defaults as Record<string, unknown>)[key];
    out[key] = d !== undefined && d !== null && typeof d === "object" && !Array.isArray(d) ? withDefaults(d, v) : v;
  }
  return out as T;
}

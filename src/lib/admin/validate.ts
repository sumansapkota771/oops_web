import type { Doc, Field, Value } from "./fields";

const MAX_TEXT = 20000;
const LINK_NAMES = new Set(["href", "cta_url", "url", "mapUrl", "mapEmbedUrl", "googleUrl", "youtubeUrl", "siteUrl"]);

/** Only allow safe link targets (blocks javascript: and data: URLs). */
export function safeHref(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v}`;
  return "";
}

function normalizeValue(field: Field, value: Value): Value {
  switch (field.type) {
    case "text":
    case "textarea":
    case "slug": {
      const s = typeof value === "string" ? value : value == null ? "" : String(value);
      const trimmed = s.trim().slice(0, MAX_TEXT);
      return LINK_NAMES.has(field.name) ? safeHref(trimmed) : trimmed;
    }
    case "url":
      return safeHref(typeof value === "string" ? value : "");
    case "number": {
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n)) return 0;
      let out = n;
      if (field.min !== undefined) out = Math.max(field.min, out);
      if (field.max !== undefined) out = Math.min(field.max, out);
      return out;
    }
    case "boolean":
      return value === true || value === "true" || value === "on";
    case "date":
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    case "select": {
      const s = typeof value === "string" ? value : "";
      if (Array.isArray(field.options) && s && !field.options.some((o) => o.value === s)) return field.options[0]?.value ?? "";
      return s;
    }
    case "image":
    case "video":
      return typeof value === "string" && value.trim() ? value.trim() : null;
    case "images":
    case "videos":
    case "list":
      return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim().slice(0, MAX_TEXT)) : [];
    case "group":
      return normalize(field.fields, value);
    case "repeater":
      return Array.isArray(value) ? value.map((item) => normalize(field.fields, item)) : [];
  }
}

/** Coerces untrusted JSON into exactly the shape described by `fields` (unknown keys are dropped). */
export function normalize(fields: Field[], input: Value): Doc {
  const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, Value>) : {};
  return Object.fromEntries(fields.map((f) => [f.name, normalizeValue(f, source[f.name])]));
}

function isEmpty(value: Value) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** Required-field errors, with readable paths (e.g. "Hero › Title"). */
export function validate(fields: Field[], doc: Doc, prefix = ""): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    const value = doc[field.name];
    const label = prefix ? `${prefix} › ${field.label}` : field.label;
    if (field.type === "group") {
      errors.push(...validate(field.fields, (value as Doc) ?? {}, label));
    } else if (field.type === "repeater") {
      (value as Doc[]).forEach((item, i) => errors.push(...validate(field.fields, item, `${label} #${i + 1}`)));
    } else if (field.required && field.type !== "slug" && isEmpty(value)) {
      errors.push(`${label} is required.`);
    }
  }
  return errors;
}

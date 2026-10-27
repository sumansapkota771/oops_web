/**
 * Schema-driven CMS: every editable thing on the site is described by these
 * field definitions. The same definition renders the admin form, validates
 * the payload on the server and fills in defaults for new items.
 */
export type Option = { value: string; label: string };

type Base = { name: string; label: string; help?: string; required?: boolean; half?: boolean };

export type Field =
  | (Base & { type: "text"; placeholder?: string })
  | (Base & { type: "url"; placeholder?: string })
  | (Base & { type: "textarea"; rows?: number; placeholder?: string })
  | (Base & { type: "number"; min?: number; max?: number; step?: number })
  | (Base & { type: "boolean" })
  | (Base & { type: "date" })
  | (Base & { type: "select"; options: Option[] | "categories" | "albums" })
  | (Base & { type: "image" })
  | (Base & { type: "images" })
  | (Base & { type: "video" })
  | (Base & { type: "videos" })
  | (Base & { type: "list"; placeholder?: string })
  | (Base & { type: "group"; fields: Field[] })
  | (Base & { type: "repeater"; fields: Field[]; itemLabel?: string; addLabel?: string })
  | (Base & { type: "slug"; from: string });

export type Value = unknown;
export type Doc = Record<string, Value>;

export const text = (name: string, label: string, extra: Partial<Base> & { placeholder?: string } = {}): Field => ({ type: "text", name, label, ...extra });
export const textarea = (name: string, label: string, extra: Partial<Base> & { rows?: number } = {}): Field => ({ type: "textarea", name, label, ...extra });
export const url = (name: string, label: string, extra: Partial<Base> & { placeholder?: string } = {}): Field => ({ type: "url", name, label, ...extra });
export const number = (name: string, label: string, extra: Partial<Base> & { min?: number; max?: number; step?: number } = {}): Field => ({ type: "number", name, label, ...extra });
export const boolean = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "boolean", name, label, ...extra });
export const date = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "date", name, label, ...extra });
export const select = (name: string, label: string, options: Option[] | "categories" | "albums", extra: Partial<Base> = {}): Field => ({ type: "select", name, label, options, ...extra });
export const image = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "image", name, label, ...extra });
export const images = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "images", name, label, ...extra });
export const video = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "video", name, label, ...extra });
export const videos = (name: string, label: string, extra: Partial<Base> = {}): Field => ({ type: "videos", name, label, ...extra });
export const list = (name: string, label: string, extra: Partial<Base> & { placeholder?: string } = {}): Field => ({ type: "list", name, label, ...extra });
export const group = (name: string, label: string, fields: Field[], extra: Partial<Base> = {}): Field => ({ type: "group", name, label, fields, ...extra });
export const repeater = (name: string, label: string, fields: Field[], extra: Partial<Base> & { itemLabel?: string; addLabel?: string } = {}): Field => ({ type: "repeater", name, label, fields, ...extra });
export const slug = (name: string, label: string, from: string): Field => ({ type: "slug", name, label, from, help: "Used in the page address. Leave empty to generate it from the title." });

const HIGHLIGHT_HELP = "Wrap words in *asterisks* to give them the colourful gradient.";

/** Eyebrow + title + subtitle block used by most sections. */
export const copy = (name: string, label: string, more: Field[] = [], withSubtitle = true): Field =>
  group(name, label, [
    text("eyebrow", "Eyebrow (small tag above the title)", { half: true }),
    text("title", "Title", { required: true, help: HIGHLIGHT_HELP }),
    ...(withSubtitle ? [textarea("subtitle", "Subtitle", { rows: 2 })] : []),
    ...more,
  ]);

export const link = (name: string, label: string): Field =>
  group(name, label, [text("label", "Button text", { half: true }), text("href", "Link (e.g. /attractions or https://…)", { half: true })]);

/** An empty value matching a field definition. */
export function emptyValue(field: Field): Value {
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "images":
    case "videos":
    case "list":
    case "repeater":
      return [];
    case "group":
      return emptyDoc(field.fields);
    case "date":
    case "image":
    case "video":
      return null;
    default:
      return "";
  }
}

export function emptyDoc(fields: Field[]): Doc {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

/** Every media-library path referenced by a document (used to preload thumbnails in the admin). */
export function collectMediaPaths(fields: Field[], doc: Doc | undefined | null): string[] {
  if (!doc) return [];
  const out: string[] = [];
  for (const f of fields) {
    const v = doc[f.name];
    if ((f.type === "image" || f.type === "video") && typeof v === "string") out.push(v);
    else if ((f.type === "images" || f.type === "videos") && Array.isArray(v)) out.push(...(v as string[]));
    else if (f.type === "group") out.push(...collectMediaPaths(f.fields, v as Doc));
    else if (f.type === "repeater" && Array.isArray(v)) for (const item of v) out.push(...collectMediaPaths(f.fields, item as Doc));
  }
  return out;
}

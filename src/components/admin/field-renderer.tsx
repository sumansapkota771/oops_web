"use client";

import { useId, useState } from "react";
import { emptyDoc, type Doc, type Field, type Option, type Value } from "@/lib/admin/fields";
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, PlusIcon, TrashIcon, XIcon } from "@/components/ui/icons";
import { slugify, cn } from "@/lib/utils";
import { MediaPicker, MediaThumb } from "./media-picker";
import { AButton, Switch, inputClass } from "./ui";

export type Ctx = { categories: Option[]; albums: Option[] };

type Props = { field: Field; value: Value; onChange: (v: Value) => void; ctx: Ctx; doc?: Doc };

const move = <T,>(arr: T[], from: number, to: number) => {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

export function Fields({ fields, value, onChange, ctx }: { fields: Field[]; value: Doc; onChange: (v: Doc) => void; ctx: Ctx }) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={cn(!field.half && "sm:col-span-2")}>
          <FieldRenderer field={field} value={value[field.name]} onChange={(v) => onChange({ ...value, [field.name]: v })} ctx={ctx} doc={value} />
        </div>
      ))}
    </div>
  );
}

function Label({ id, field }: { id: string; field: Field }) {
  return (
    <>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {field.label}
        {field.required ? <span className="text-pink"> *</span> : null}
      </label>
    </>
  );
}

function Help({ field }: { field: Field }) {
  return field.help ? <p className="mt-1.5 text-xs text-subtle">{field.help}</p> : null;
}

function FieldRenderer({ field, value, onChange, ctx, doc }: Props) {
  const id = useId();
  const [picker, setPicker] = useState(false);

  switch (field.type) {
    case "text":
    case "url":
      return (
        <div>
          <Label id={id} field={field} />
          <input id={id} type={field.type === "url" ? "url" : "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={"placeholder" in field ? field.placeholder : undefined} className={inputClass} />
          <Help field={field} />
        </div>
      );

    case "slug": {
      const source = (doc?.[field.from] as string) ?? "";
      const text = (value as string) ?? "";
      return (
        <div>
          <Label id={id} field={field} />
          <input id={id} value={text} onChange={(e) => onChange(slugify(e.target.value))} placeholder={slugify(source) || "auto"} className={inputClass} />
          <Help field={field} />
        </div>
      );
    }

    case "textarea":
      return (
        <div>
          <Label id={id} field={field} />
          <textarea id={id} rows={field.rows ?? 3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={cn(inputClass, "resize-y")} />
          <Help field={field} />
        </div>
      );

    case "number":
      return (
        <div>
          <Label id={id} field={field} />
          <input id={id} type="number" inputMode="numeric" min={field.min} max={field.max} step={field.step} value={Number.isFinite(value as number) ? (value as number) : 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className={inputClass} />
          <Help field={field} />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
          <span id={id} className="text-sm font-medium">
            {field.label}
          </span>
          <Switch checked={Boolean(value)} onChange={onChange} label={field.label} />
        </div>
      );

    case "date":
      return (
        <div>
          <Label id={id} field={field} />
          <div className="flex gap-2">
            <input id={id} type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} className={inputClass} />
            {value ? (
              <AButton variant="quiet" onClick={() => onChange(null)} aria-label={`Clear ${field.label}`}>
                <XIcon size={16} aria-hidden />
              </AButton>
            ) : null}
          </div>
          <Help field={field} />
        </div>
      );

    case "select": {
      const options = field.options === "categories" ? ctx.categories : field.options === "albums" ? ctx.albums : field.options;
      return (
        <div>
          <Label id={id} field={field} />
          <select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {!field.required ? <option value="">— None —</option> : null}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Help field={field} />
        </div>
      );
    }

    case "image":
    case "video": {
      const path = (value as string) ?? "";
      const kind = field.type;
      return (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {field.label}
            {field.required ? <span className="text-pink"> *</span> : null}
          </span>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
            {path ? <MediaThumb path={path} className="size-20" /> : <span className="flex size-20 items-center justify-center rounded-lg bg-space-800 text-xs text-subtle">None</span>}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {path ? <span className="truncate text-xs text-subtle">{path}</span> : null}
              <div className="flex flex-wrap gap-2">
                <AButton onClick={() => setPicker(true)}>{path ? "Change" : kind === "video" ? "Choose video" : "Choose photo"}</AButton>
                {path ? (
                  <AButton variant="danger" onClick={() => onChange(null)}>
                    Remove
                  </AButton>
                ) : null}
              </div>
            </div>
          </div>
          <MediaPicker open={picker} onClose={() => setPicker(false)} kind={kind} onPick={(items) => onChange(items[0].path)} />
          <Help field={field} />
        </div>
      );
    }

    case "images":
    case "videos": {
      const paths = (value as string[]) ?? [];
      const kind = field.type === "videos" ? "video" : "image";
      return (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {field.label} <span className="font-normal normal-case tracking-normal text-subtle">({paths.length})</span>
          </span>
          <div className="rounded-xl bg-white/[0.04] p-3">
            {paths.length ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {paths.map((p, i) => (
                  <li key={`${p}-${i}`} className="group relative">
                    <MediaThumb path={p} className="aspect-square w-full" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-0.5 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" aria-label="Move earlier" onClick={() => onChange(move(paths, i, i - 1))} className="rounded bg-black/60 p-1">
                        <ArrowLeftIcon size={12} aria-hidden />
                      </button>
                      <button type="button" aria-label="Remove" onClick={() => onChange(paths.filter((_, j) => j !== i))} className="rounded bg-pink/80 p-1">
                        <TrashIcon size={12} aria-hidden />
                      </button>
                      <button type="button" aria-label="Move later" onClick={() => onChange(move(paths, i, i + 1))} className="rounded bg-black/60 p-1">
                        <ArrowRightIcon size={12} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-subtle">Nothing added yet.</p>
            )}
            <AButton className="mt-3" onClick={() => setPicker(true)}>
              <PlusIcon size={14} aria-hidden /> Add {kind === "video" ? "videos" : "photos"}
            </AButton>
          </div>
          <MediaPicker open={picker} onClose={() => setPicker(false)} kind={kind} multiple onPick={(items) => onChange([...paths, ...items.map((i) => i.path).filter((p) => !paths.includes(p))])} />
          <Help field={field} />
        </div>
      );
    }

    case "list": {
      const items = (value as string[]) ?? [];
      const long = field.name === "paragraphs" || field.name === "items" || field.name === "terms" || field.name === "notes" || field.name === "inclusions";
      return (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">{field.label}</span>
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                {long ? (
                  <textarea rows={2} aria-label={`${field.label} ${i + 1}`} value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={field.placeholder} className={cn(inputClass, "resize-y")} />
                ) : (
                  <input aria-label={`${field.label} ${i + 1}`} value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={field.placeholder} className={inputClass} />
                )}
                <div className="flex shrink-0 gap-1">
                  <AButton variant="quiet" aria-label="Move up" onClick={() => onChange(move(items, i, i - 1))} className="px-2">
                    <CaretDownIcon size={14} className="rotate-180" aria-hidden />
                  </AButton>
                  <AButton variant="quiet" aria-label="Move down" onClick={() => onChange(move(items, i, i + 1))} className="px-2">
                    <CaretDownIcon size={14} aria-hidden />
                  </AButton>
                  <AButton variant="danger" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-2">
                    <TrashIcon size={14} aria-hidden />
                  </AButton>
                </div>
              </li>
            ))}
          </ul>
          <AButton className="mt-2" onClick={() => onChange([...items, ""])}>
            <PlusIcon size={14} aria-hidden /> Add
          </AButton>
          <Help field={field} />
        </div>
      );
    }

    case "group":
      return (
        <fieldset className="rounded-2xl bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] sm:p-5">
          <legend className="px-2 text-sm font-extrabold uppercase tracking-wider text-sea-300">{field.label}</legend>
          <Fields fields={field.fields} value={(value as Doc) ?? {}} onChange={onChange} ctx={ctx} />
        </fieldset>
      );

    case "repeater": {
      const items = (value as Doc[]) ?? [];
      return (
        <fieldset className="rounded-2xl bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] sm:p-5">
          <legend className="px-2 text-sm font-extrabold uppercase tracking-wider text-sea-300">
            {field.label} <span className="font-normal text-subtle">({items.length})</span>
          </legend>
          {field.help ? <p className="mb-3 text-xs text-subtle">{field.help}</p> : null}
          <ul className="flex flex-col gap-3">
            {items.map((item, i) => (
              <RepeaterItem
                key={i}
                title={String(item[field.itemLabel ?? ""] || `${field.label} ${i + 1}`)}
                onUp={() => onChange(move(items, i, i - 1))}
                onDown={() => onChange(move(items, i, i + 1))}
                onRemove={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Fields fields={field.fields} value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} ctx={ctx} />
              </RepeaterItem>
            ))}
          </ul>
          <AButton className="mt-3" onClick={() => onChange([...items, emptyDoc(field.fields)])}>
            <PlusIcon size={14} aria-hidden /> {field.addLabel ?? "Add"}
          </AButton>
        </fieldset>
      );
    }
  }
}

function RepeaterItem({ title, children, onUp, onDown, onRemove }: { title: string; children: React.ReactNode; onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <li className="rounded-xl bg-space-900/70 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <div className="flex items-center gap-1 p-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-10 flex-1 items-center gap-2 rounded-lg px-2 text-left text-sm font-semibold hover:bg-white/5">
          <CaretDownIcon size={14} className={cn("transition-transform", !open && "-rotate-90")} aria-hidden />
          <span className="truncate">{title}</span>
        </button>
        <AButton variant="quiet" aria-label="Move up" onClick={onUp} className="px-2">
          <CaretDownIcon size={14} className="rotate-180" aria-hidden />
        </AButton>
        <AButton variant="quiet" aria-label="Move down" onClick={onDown} className="px-2">
          <CaretDownIcon size={14} aria-hidden />
        </AButton>
        <AButton variant="danger" aria-label="Remove" onClick={onRemove} className="px-2">
          <TrashIcon size={14} aria-hidden />
        </AButton>
      </div>
      {open ? <div className="border-t border-white/[0.07] p-4">{children}</div> : null}
    </li>
  );
}

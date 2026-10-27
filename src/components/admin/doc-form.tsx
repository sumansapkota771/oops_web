"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ActionResult } from "@/app/admin/actions";
import type { Doc, Field } from "@/lib/admin/fields";
import { Fields, type Ctx } from "./field-renderer";
import { AButton, Card, useToast } from "./ui";

type Props = {
  fields: Field[];
  initial: Doc;
  ctx: Ctx;
  /** Called with the JSON document; returns the save result. */
  save: (payload: string) => Promise<ActionResult>;
  /** After creating a new item, go to `${afterCreateBase}/${id}`. */
  afterCreateBase?: string;
  backHref?: string;
  /** Extra read-only note (e.g. "Supabase not connected"). */
  readOnlyReason?: string;
  onDelete?: () => Promise<ActionResult>;
  viewHref?: string;
};

/** Generic editor driven entirely by field definitions. */
export function DocForm({ fields, initial, ctx, save, afterCreateBase, backHref, readOnlyReason, onDelete, viewHref }: Props) {
  const [doc, setDoc] = useState<Doc>(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submit = () =>
    start(async () => {
      const res = await save(JSON.stringify(doc));
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("ok", res.message ?? "Saved.");
      if (res.id && afterCreateBase) router.replace(`${afterCreateBase}/${res.id}`);
      else router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      {readOnlyReason ? <p className="rounded-xl bg-yellow/10 px-4 py-3 text-sm text-[#ffe07a]">{readOnlyReason}</p> : null}
      <Card>
        <Fields
          fields={fields}
          value={doc}
          onChange={(v) => {
            setDoc(v);
            setDirty(true);
          }}
          ctx={ctx}
        />
      </Card>
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-white/10 bg-space-950/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <AButton type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </AButton>
        {backHref ? (
          <Link href={backHref} className="inline-flex min-h-10 items-center rounded-xl px-4 text-xs font-semibold uppercase tracking-wider text-muted hover:bg-white/[0.07]">
            Back
          </Link>
        ) : null}
        {viewHref ? (
          <a href={viewHref} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl px-4 text-xs font-semibold uppercase tracking-wider text-muted hover:bg-white/[0.07]">
            View on site ↗
          </a>
        ) : null}
        {dirty ? <span className="text-xs text-yellow">Unsaved changes</span> : null}
        {onDelete ? (
          <AButton
            variant="danger"
            className="ml-auto"
            disabled={pending}
            onClick={() =>
              confirm("Delete this item permanently?") &&
              start(async () => {
                const res = await onDelete();
                if (!res.ok) return toast("error", res.error);
                toast("ok", "Deleted.");
                router.replace(backHref ?? "/admin");
              })
            }
          >
            Delete
          </AButton>
        ) : null}
      </div>
    </form>
  );
}

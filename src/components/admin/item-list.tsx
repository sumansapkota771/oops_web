"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteItemAction, reorderAction, toggleItemAction } from "@/app/admin/actions";
import type { Collection } from "@/lib/admin/collections";
import type { Doc, Option } from "@/lib/admin/fields";
import { CaretDownIcon, EyeIcon, EyeSlashIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { MediaThumb } from "./media-picker";
import { AButton, Card, inputClass, useToast } from "./ui";

const PAGE = 60;

export function ItemList({ collection, rows, groups, canEdit }: { collection: Collection; rows: Doc[]; groups?: Option[]; canEdit: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [list, setList] = useState(rows);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [shown, setShown] = useState(PAGE);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter((r) => (!group || r[collection.groupBy ?? ""] === group) && (!needle || String(r[collection.titleField] ?? "").toLowerCase().includes(needle) || String(r[collection.subtitleField ?? ""] ?? "").toLowerCase().includes(needle)));
  }, [list, q, group, collection]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error ?? "Something went wrong.");
      onOk?.();
      router.refresh();
    });

  const moveRow = (id: string, dir: -1 | 1 | "top") => {
    const visibleIds = matches.map((r) => r.id as string);
    const at = visibleIds.indexOf(id);
    const targetId = dir === "top" ? visibleIds[0] : visibleIds[at + dir];
    if (!targetId || targetId === id) return;
    const next = [...list];
    const from = next.findIndex((r) => r.id === id);
    const [item] = next.splice(from, 1);
    const to = next.findIndex((r) => r.id === targetId);
    next.splice(dir === 1 ? to + 1 : to, 0, item);
    setList(next);
    run(() => reorderAction(collection.key, next.map((r) => r.id as string)));
  };

  const title = (r: Doc) => String(r[collection.titleField] ?? "") || "(untitled)";
  const subtitle = (r: Doc) => (collection.subtitleField ? String(r[collection.subtitleField] ?? "") : "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${collection.label.toLowerCase()}…`} aria-label="Search" className={cn(inputClass, "max-w-xs")} />
        {groups && collection.groupBy ? (
          <select value={group} onChange={(e) => (setGroup(e.target.value), setShown(PAGE))} aria-label="Filter" className={cn(inputClass, "max-w-56")}>
            <option value="">All</option>
            {groups.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        ) : null}
        <span className="text-sm text-subtle">{matches.length} items</span>
        {canEdit ? (
          <Link href={`/admin/${collection.key}/new`} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-sea-400 px-4 text-xs font-semibold uppercase tracking-wider text-space-950 hover:bg-sea-300">
            <PlusIcon size={14} aria-hidden /> New {collection.singular.toLowerCase()}
          </Link>
        ) : null}
      </div>

      {matches.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-muted">Nothing here yet.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {matches.slice(0, shown).map((r, i) => {
            const id = r.id as string;
            const visible = r.is_visible !== false;
            const img = collection.imageField ? (r[collection.imageField] as string | null) : null;
            return (
              <li key={id} className={cn("flex items-center gap-3 rounded-2xl bg-space-850 p-2.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] [content-visibility:auto]", !visible && "opacity-55")}>
                {collection.imageField ? img ? <MediaThumb path={img} className="size-14" /> : <span className="size-14 shrink-0 rounded-lg bg-space-800" /> : null}
                <Link href={`/admin/${collection.key}/${id}`} className="min-w-0 flex-1 rounded-lg px-2 py-1 hover:bg-white/5">
                  <span className="block truncate font-semibold">{title(r)}</span>
                  {subtitle(r) ? <span className="block truncate text-xs text-subtle">{subtitle(r)}</span> : null}
                </Link>
                {canEdit ? (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <AButton variant="quiet" className="px-2" aria-label="Move to top" title="Move to top" disabled={pending || i === 0} onClick={() => moveRow(id, "top")}>
                      ⤒
                    </AButton>
                    <AButton variant="quiet" className="px-2" aria-label="Move up" disabled={pending || i === 0} onClick={() => moveRow(id, -1)}>
                      <CaretDownIcon size={14} className="rotate-180" aria-hidden />
                    </AButton>
                    <AButton variant="quiet" className="px-2" aria-label="Move down" disabled={pending || i === matches.length - 1} onClick={() => moveRow(id, 1)}>
                      <CaretDownIcon size={14} aria-hidden />
                    </AButton>
                    <AButton
                      variant="quiet"
                      className="px-2"
                      aria-label={visible ? "Hide from website" : "Show on website"}
                      title={visible ? "Visible — click to hide" : "Hidden — click to show"}
                      disabled={pending}
                      onClick={() => {
                        setList((l) => l.map((x) => (x.id === id ? { ...x, is_visible: !visible } : x)));
                        run(() => toggleItemAction(collection.key, id, !visible));
                      }}
                    >
                      {visible ? <EyeIcon size={16} aria-hidden /> : <EyeSlashIcon size={16} aria-hidden />}
                    </AButton>
                    <AButton
                      variant="danger"
                      className="px-2"
                      aria-label={`Delete ${title(r)}`}
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(`Delete “${title(r)}” permanently?`)) return;
                        run(
                          () => deleteItemAction(collection.key, id),
                          () => setList((l) => l.filter((x) => x.id !== id)),
                        );
                      }}
                    >
                      <TrashIcon size={14} aria-hidden />
                    </AButton>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {matches.length > shown ? (
        <div className="text-center">
          <AButton onClick={() => setShown((n) => n + PAGE)}>Show more ({matches.length - shown} left)</AButton>
        </div>
      ) : null}
    </div>
  );
}

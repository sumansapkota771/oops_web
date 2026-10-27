"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteMediaAction, listMediaAction, updateMediaAction } from "@/app/admin/actions";
import type { MediaItem } from "@/lib/admin/store";
import { CopyIcon, SpinnerGapIcon, TrashIcon, UploadSimpleIcon, VideoCameraIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { uploadFile } from "./uploader";
import { AButton, inputClass, useToast } from "./ui";

export function MediaLibrary({ canEdit }: { canEdit: boolean }) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [folders, setFolders] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [kind, setKind] = useState<"any" | "image" | "video">("any");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [active, setActive] = useState<MediaItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      try {
        const res = await listMediaAction({ q, folder: folder || undefined, kind, offset });
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setFolders(res.folders);
      } catch (e) {
        toast("error", (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [q, folder, kind, toast],
  );

  useEffect(() => {
    const t = setTimeout(() => load(0, true), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const upload = async (files: FileList | File[]) => {
    const list = [...files];
    const done: MediaItem[] = [];
    for (const [i, file] of list.entries()) {
      try {
        setUploading(`Uploading ${i + 1} of ${list.length}: ${file.name}`);
        done.push(await uploadFile(file, folder || "uploads", (l) => setUploading(`${file.name} — ${l}`)));
      } catch (e) {
        toast("error", `${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(null);
    if (done.length) {
      setItems((prev) => [...done, ...prev]);
      setTotal((t) => t + done.length);
      toast("ok", `${done.length} file${done.length === 1 ? "" : "s"} uploaded.`);
    }
  };

  return (
    <div className="flex flex-col gap-4" onDragOver={(e) => canEdit && e.preventDefault()} onDrop={(e) => { if (!canEdit) return; e.preventDefault(); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}>
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" aria-label="Search" className={cn(inputClass, "max-w-xs")} />
        <select value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Folder" className={cn(inputClass, "max-w-56")}>
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Type" className={cn(inputClass, "max-w-40")}>
          <option value="any">Photos & videos</option>
          <option value="image">Photos</option>
          <option value="video">Videos</option>
        </select>
        <span className="text-sm text-subtle">{total} files</span>
        {canEdit ? (
          <AButton variant="primary" className="ml-auto" disabled={Boolean(uploading)} onClick={() => fileInput.current?.click()}>
            <UploadSimpleIcon size={16} aria-hidden /> Upload {folder ? `to ${folder}` : ""}
          </AButton>
        ) : null}
        <input ref={fileInput} hidden type="file" multiple accept="image/*,video/mp4,video/webm,application/pdf" onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
      </div>
      {uploading ? (
        <p className="flex items-center gap-2 rounded-xl bg-sea-400/10 px-4 py-2 text-sm text-sea-200">
          <SpinnerGapIcon size={16} className="animate-spin" aria-hidden /> {uploading}
        </p>
      ) : null}
      {canEdit ? <p className="text-xs text-subtle">Tip: drop files anywhere on this page. Photos are resized to WebP automatically; videos must be under 50 MB.</p> : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <li key={item.path}>
            <button type="button" onClick={() => setActive(item)} title={item.path} className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-space-800 focus-visible:outline-2">
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                <img src={item.thumb} alt={item.alt ?? ""} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span className="p-2 text-xs text-subtle">{item.name}</span>
              )}
              {item.kind === "video" ? <VideoCameraIcon size={18} className="absolute bottom-1.5 right-1.5" aria-hidden /> : null}
            </button>
          </li>
        ))}
      </ul>
      {loading ? <p className="text-center text-sm text-muted">Loading…</p> : null}
      {items.length < total && !loading ? (
        <div className="text-center">
          <AButton onClick={() => load(items.length, false)}>Load more ({total - items.length} left)</AButton>
        </div>
      ) : null}

      {active ? (
        <Detail
          key={active.path}
          item={active}
          canEdit={canEdit}
          onClose={() => setActive(null)}
          onSaved={(alt) => setItems((l) => l.map((x) => (x.path === active.path ? { ...x, alt } : x)))}
          onDeleted={() => {
            setItems((l) => l.filter((x) => x.path !== active.path));
            setTotal((t) => t - 1);
            setActive(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Detail({ item, canEdit, onClose, onSaved, onDeleted }: { item: MediaItem; canEdit: boolean; onClose: () => void; onSaved: (alt: string) => void; onDeleted: () => void }) {
  const toast = useToast();
  const [alt, setAlt] = useState(item.alt ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="File details" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="grid max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-space-900 shadow-2xl md:grid-cols-[1.2fr_1fr]">
        <div className="flex items-center justify-center bg-black/40 p-4">
          {item.kind === "video" ? (
            <video src={item.url} poster={item.thumb} controls className="max-h-[70dvh] w-full rounded-xl" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview
            <img src={item.url} alt={item.alt ?? ""} className="max-h-[70dvh] rounded-xl object-contain" />
          )}
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="break-all text-base font-bold">{item.name || item.path}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-white/10">
              <XIcon size={18} aria-hidden />
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs text-muted">
            <dt>Size</dt>
            <dd>{item.width && item.height ? `${item.width} × ${item.height}` : "—"}</dd>
            <dt>File</dt>
            <dd>{(item.bytes / 1024 / 1024).toFixed(2)} MB</dd>
            <dt>Folder</dt>
            <dd className="break-all">{item.folder}</dd>
          </dl>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Path (used by the site)</p>
            <div className="flex gap-2">
              <input readOnly value={item.path} className={inputClass} aria-label="Path" />
              <AButton aria-label="Copy path" onClick={() => navigator.clipboard.writeText(item.path).then(() => toast("ok", "Path copied."))}>
                <CopyIcon size={14} aria-hidden />
              </AButton>
            </div>
          </div>
          <div>
            <label htmlFor="alt" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
              Description (alt text, for screen readers & Google)
            </label>
            <textarea id="alt" rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} disabled={!canEdit} className={inputClass} />
          </div>
          {canEdit ? (
            <div className="mt-auto flex flex-wrap gap-2">
              <AButton
                variant="primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const res = await updateMediaAction(item.path, { alt, name: item.name ?? undefined });
                  setBusy(false);
                  if (!res.ok) return toast("error", res.error);
                  onSaved(alt);
                  toast("ok", "Saved.");
                }}
              >
                Save description
              </AButton>
              <AButton
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (!confirm("Delete this file permanently? Pages that use it will show a gap until you pick another.")) return;
                  setBusy(true);
                  const res = await deleteMediaAction(item.path);
                  setBusy(false);
                  if (!res.ok) return toast("error", res.error);
                  toast("ok", "File deleted.");
                  onDeleted();
                }}
              >
                <TrashIcon size={14} aria-hidden /> Delete
              </AButton>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

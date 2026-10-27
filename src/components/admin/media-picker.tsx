"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { listMediaAction } from "@/app/admin/actions";
import type { MediaItem } from "@/lib/admin/store";
import { cn } from "@/lib/utils";
import { VideoCameraIcon, UploadSimpleIcon, SpinnerGapIcon, CheckIcon, XIcon } from "@/components/ui/icons";
import { AButton, inputClass, useToast } from "./ui";
import { uploadFile } from "./uploader";

// ---------------------------------------------------------------------------
// Media index: path → item, so forms can show thumbnails for saved values.
// ---------------------------------------------------------------------------
type Index = Record<string, MediaItem>;
const MediaContext = createContext<{ index: Index; add: (items: MediaItem[]) => void }>({ index: {}, add: () => {} });

export function MediaProvider({ initial, children }: { initial: Index; children: ReactNode }) {
  const [index, setIndex] = useState<Index>(initial);
  const add = useCallback((items: MediaItem[]) => setIndex((prev) => ({ ...prev, ...Object.fromEntries(items.map((i) => [i.path, i])) })), []);
  return <MediaContext value={{ index, add }}>{children}</MediaContext>;
}

export const useMediaIndex = () => useContext(MediaContext);

/** Small preview of a library file (or its path when it isn't in the library). */
export function MediaThumb({ path, className }: { path: string; className?: string }) {
  const { index } = useMediaIndex();
  const item = index[path];
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-space-800", className)}>
      {item?.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of a pre-generated rendition
        <img
          src={item.thumb}
          alt={item.alt ?? ""}
          className={cn("size-full", /^(brand|gallery\/partners)/.test(item.folder) ? "bg-white/90 object-contain p-1" : "object-cover")}
          loading="lazy"
        />
      ) : (
        <span className="px-1 text-center text-[0.6rem] leading-tight text-subtle">{item ? "video" : path.split("/").pop()}</span>
      )}
      {item?.kind === "video" ? (
        <span className="absolute bottom-1 right-1 rounded bg-black/70 p-0.5">
          <VideoCameraIcon size={12} aria-hidden />
        </span>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Picker dialog
// ---------------------------------------------------------------------------
type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (items: MediaItem[]) => void;
  kind: "image" | "video";
  multiple?: boolean;
  /** Folder preselected when the dialog opens (e.g. "gallery/general"). */
  folder?: string;
};

export function MediaPicker({ open, onClose, onPick, kind, multiple = false, folder: initialFolder = "" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const { add } = useMediaIndex();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [folders, setFolders] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState(initialFolder);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      try {
        const res = await listMediaAction({ q, folder: folder || undefined, kind, offset });
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setFolders(res.folders);
        add(res.items);
      } catch (e) {
        toast("error", (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [q, folder, kind, add, toast],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(0, true), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [open, load, q]);

  const toggle = (item: MediaItem) => {
    if (!multiple) {
      onPick([item]);
      onClose();
      return;
    }
    setSelected((s) => (s.some((x) => x.path === item.path) ? s.filter((x) => x.path !== item.path) : [...s, item]));
  };

  const upload = async (files: FileList | File[]) => {
    const list = [...files];
    const uploaded: MediaItem[] = [];
    for (const [i, file] of list.entries()) {
      try {
        setUploading(`Uploading ${i + 1} of ${list.length}: ${file.name}`);
        const item = await uploadFile(file, folder || "uploads", (label) => setUploading(`${file.name} — ${label}`));
        uploaded.push(item);
      } catch (e) {
        toast("error", `${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(null);
    if (!uploaded.length) return;
    add(uploaded);
    setItems((prev) => [...uploaded, ...prev]);
    setTotal((t) => t + uploaded.length);
    toast("ok", `${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded.`);
    if (!multiple) {
      onPick([uploaded[0]]);
      onClose();
    } else {
      setSelected((s) => [...s, ...uploaded]);
    }
  };

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setSelected([]);
        onClose();
      }}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto h-[min(88dvh,52rem)] w-[min(96vw,64rem)] rounded-3xl bg-space-900 p-0 text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_40px_120px_rgb(0_0_0/0.8)] backdrop:bg-black/70"
    >
      {open ? (
        <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
            <h2 className="mr-auto text-lg font-extrabold uppercase">Choose {kind === "video" ? "a video" : multiple ? "photos" : "a photo"}</h2>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search media" className={cn(inputClass, "w-44")} />
            <select value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Folder" className={cn(inputClass, "w-48")}>
              <option value="">All folders</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <AButton variant="primary" onClick={() => fileInput.current?.click()} disabled={Boolean(uploading)}>
              <UploadSimpleIcon size={16} aria-hidden /> Upload
            </AButton>
            <input
              ref={fileInput}
              type="file"
              hidden
              multiple={multiple}
              accept={kind === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={(e) => {
                if (e.target.files?.length) upload(e.target.files);
                e.target.value = "";
              }}
            />
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="flex size-10 items-center justify-center rounded-xl hover:bg-white/10">
              <XIcon size={18} aria-hidden />
            </button>
          </header>

          {uploading ? (
            <p className="flex items-center gap-2 bg-sea-400/10 px-4 py-2 text-sm text-sea-200">
              <SpinnerGapIcon size={16} className="animate-spin" aria-hidden /> {uploading}
            </p>
          ) : null}

          <div
            className="flex-1 overflow-y-auto overscroll-contain p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
            }}
          >
            {items.length === 0 && !loading ? (
              <p className="py-20 text-center text-muted">No files found. Drop files here or press Upload.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {items.map((item) => {
                  const on = selected.some((x) => x.path === item.path);
                  return (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        aria-pressed={multiple ? on : undefined}
                        title={item.path}
                        className={cn("group relative block aspect-square w-full overflow-hidden rounded-xl bg-space-800", on && "ring-2 ring-sea-300")}
                      >
                        {item.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                          <img src={item.thumb} alt={item.alt ?? item.name ?? ""} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <span className="p-2 text-xs text-subtle">{item.name}</span>
                        )}
                        {item.kind === "video" ? <VideoCameraIcon size={18} className="absolute bottom-1.5 right-1.5 drop-shadow" aria-hidden /> : null}
                        {on ? (
                          <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-sea-300 text-space-950">
                            <CheckIcon size={14} weight="bold" aria-hidden />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {items.length < total ? (
              <div className="mt-4 text-center">
                <AButton onClick={() => load(items.length, false)} disabled={loading}>
                  {loading ? "Loading…" : `Load more (${total - items.length} left)`}
                </AButton>
              </div>
            ) : null}
          </div>

          {multiple ? (
            <footer className="flex items-center justify-between gap-3 border-t border-white/10 p-4">
              <span className="text-sm text-muted">{selected.length} selected</span>
              <AButton
                variant="primary"
                disabled={!selected.length}
                onClick={() => {
                  onPick(selected);
                  dialog.current?.close();
                }}
              >
                Add {selected.length || ""} selected
              </AButton>
            </footer>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

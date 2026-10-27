"use client";

import { useState, useSyncExternalStore } from "react";
import type { ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LogoTile } from "./logo-tile";
import { PhotoGrid } from "./photo-grid";

export type GalleryAlbumView = {
  slug: string;
  title: string;
  description: string | null;
  layout: "photos" | "people" | "logos";
  items: Array<{ image: ImageData; caption: string | null }>;
};

/** Album tabs synced with the URL hash (e.g. /gallery#hall-of-fame). */
export function GalleryTabs({ albums }: { albums: GalleryAlbumView[] }) {
  const hash = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => window.location.hash.replace("#", ""),
    () => "",
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const active = chosen ?? hash;

  const album = albums.find((a) => a.slug === active) ?? albums[0];
  if (!album) return null;

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Albums" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {albums.map((a) => {
          const selected = a.slug === album.slug;
          return (
            <button
              key={a.slug}
              id={`tab-${a.slug}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${a.slug}`}
              onClick={() => {
                setChosen(a.slug);
                history.replaceState(null, "", `#${a.slug}`);
              }}
              className={cn(
                "inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-6 text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                selected ? "bg-ink text-space-950" : "bg-white/[0.05] text-muted hairline hover:text-ink",
              )}
            >
              {a.title}
              <span className={selected ? "text-space-950/60" : "text-subtle"}>{a.items.length}</span>
            </button>
          );
        })}
      </div>

      <div id={`panel-${album.slug}`} role="tabpanel" aria-labelledby={`tab-${album.slug}`} className="flex flex-col gap-8">
        {album.description ? <p className="max-w-2xl text-muted">{album.description}</p> : null}
        {album.layout === "logos" ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {album.items.map((item, i) => (
              <li key={`${item.image.base}-${i}`}>
                <LogoTile image={item.image} name={item.caption} className="h-24 w-full sm:h-28" />
              </li>
            ))}
          </ul>
        ) : (
          <PhotoGrid key={album.slug} photos={album.items} variant={album.layout === "people" ? "people" : "masonry"} />
        )}
      </div>
    </div>
  );
}

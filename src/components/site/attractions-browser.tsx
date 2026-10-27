"use client";

import { useState, useSyncExternalStore } from "react";
import type { Attraction, Category, ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ACCENTS, accentFor } from "./accent";
import { AttractionCard } from "./cards";

type Item = { attraction: Attraction; image: ImageData | undefined };

/** Category filter chips + attraction grid (filtering happens instantly on the client). */
export function AttractionsBrowser({ items, categories }: { items: Item[]; categories: Category[] }) {
  // The selected category lives in the URL hash (e.g. /attractions#arcade-games) so it can be shared and survives reloads.
  const hash = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => window.location.hash.replace("#", ""),
    () => "",
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const active = categories.some((c) => c.slug === (chosen ?? hash)) ? (chosen ?? hash) : "all";
  const byCategory = new Map(categories.map((c) => [c.slug, c]));
  const used = categories.filter((c) => items.some((i) => i.attraction.category_slug === c.slug));
  const visible = active === "all" ? items : items.filter((i) => i.attraction.category_slug === active);

  return (
    <div className="flex flex-col gap-10">
      <div role="group" aria-label="Filter attractions by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ slug: "all", name: "All", accent: "sea" as const }, ...used].map((c) => {
          const selected = active === c.slug;
          const accent = ACCENTS[accentFor(c.accent)];
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setChosen(c.slug);
                history.replaceState(null, "", c.slug === "all" ? window.location.pathname : `#${c.slug}`);
              }}
              aria-pressed={selected}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                selected ? "bg-ink text-space-950" : "bg-white/[0.05] text-muted hairline hover:text-ink",
              )}
            >
              <span className={cn("size-2 rounded-full", accent.dot)} aria-hidden />
              {c.name}
              <span className={cn("text-[0.65rem]", selected ? "text-space-950/60" : "text-subtle")}>
                {c.slug === "all" ? items.length : items.filter((i) => i.attraction.category_slug === c.slug).length}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="sr-only">Attractions</h2>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} attractions
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ attraction, image }, i) => (
          <li key={attraction.id} className="animate-[fade-in_0.6s_var(--ease-fluid)_both]" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <AttractionCard
              attraction={attraction}
              category={attraction.category_slug ? byCategory.get(attraction.category_slug) : undefined}
              image={image}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

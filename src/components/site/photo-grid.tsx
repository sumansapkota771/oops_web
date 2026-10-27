"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Img } from "@/components/ui/img";
import type { ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

export type GalleryPhoto = { image: ImageData; caption?: string | null };

function slides(photos: GalleryPhoto[]) {
  return photos.map(({ image, caption }) => {
    const { base, ext, widths, width, height } = image;
    const largest = widths.length ? `${base}-${widths[widths.length - 1]}.${ext}` : ext ? `${base}.${ext}` : base;
    return {
      src: largest,
      width,
      height,
      alt: image.alt,
      title: caption ?? undefined,
      srcSet: widths.map((w) => ({ src: `${base}-${w}.${ext}`, width: w, height: Math.round((height / width) * w) })),
    };
  });
}

/** Masonry photo grid that opens an accessible, keyboard-friendly lightbox. */
export function PhotoGrid({
  photos,
  variant = "masonry",
  className,
}: {
  photos: GalleryPhoto[];
  variant?: "masonry" | "people" | "strip";
  className?: string;
}) {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <ul
        className={cn(
          variant === "masonry" && "columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4",
          variant === "people" && "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
          variant === "strip" && "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
          className,
        )}
      >
        {photos.map(({ image, caption }, i) => (
          <li
            key={`${image.base}-${i}`}
            className={cn(
              variant === "masonry" && "mb-3 break-inside-avoid sm:mb-4",
              variant === "strip" && "w-64 shrink-0 snap-start sm:w-72",
            )}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-space-800 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]"
              aria-label={`Open photo${caption ? `: ${caption}` : ` ${i + 1}`}`}
            >
              <Img
                image={image}
                sizes={variant === "masonry" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 22rem, 50vw"}
                className={cn(
                  "w-full transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]",
                  variant === "masonry" ? "h-auto" : "aspect-[4/5] object-cover",
                )}
              />
              {caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-space-950/90 to-transparent px-4 pb-3 pt-10 text-left text-sm font-semibold uppercase tracking-wide">
                  {caption}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        slides={slides(photos)}
        plugins={[Captions]}
        styles={{ container: { backgroundColor: "rgba(3, 5, 11, 0.96)" } }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}

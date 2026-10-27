"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Img } from "@/components/ui/img";
import { MagnifyingGlassIcon } from "@/components/ui/icons";
import type { ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A poster that opens full-screen (with zoom) so the fine print is readable. */
export function PosterLightbox({ image, label, className, sizes = "(min-width: 1024px) 34vw, 100vw" }: { image: ImageData; label: string; className?: string; sizes?: string }) {
  const [open, setOpen] = useState(false);
  const largest = image.widths.length ? `${image.base}-${image.widths[image.widths.length - 1]}.${image.ext}` : `${image.base}.${image.ext}`;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("group relative block w-full overflow-hidden rounded-[calc(2rem-0.375rem)]", className)}
        aria-label={`View poster: ${label}`}
      >
        <Img image={image} sizes={sizes} className="h-auto w-full transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.03]" />
        <span className="absolute bottom-4 right-4 flex min-h-10 items-center gap-2 rounded-full bg-space-950/75 px-4 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <MagnifyingGlassIcon size={16} aria-hidden /> View poster
        </span>
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: largest, width: image.width, height: image.height, alt: image.alt }]}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
        styles={{ container: { backgroundColor: "rgba(3, 5, 11, 0.96)" } }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}

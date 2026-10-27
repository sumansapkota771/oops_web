/* eslint-disable @next/next/no-img-element -- responsive WebP renditions are pre-generated; see lib/media.ts */
import type { CSSProperties } from "react";
import type { ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  image: ImageData | undefined;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  placeholder?: boolean;
  alt?: string;
};

/** Responsive <img> with srcset over pre-generated renditions and a blurred placeholder. */
export function Img({ image, sizes = "100vw", className, style, priority = false, placeholder = true, alt }: Props) {
  if (!image) return null;
  const { base, ext, widths, width, height, blur } = image;
  const fileFor = (w: number) => `${base}-${w}.${ext}`;
  const fallbackWidth = widths.find((w) => w >= 960) ?? widths[widths.length - 1];
  const src = widths.length ? fileFor(fallbackWidth) : ext ? `${base}.${ext}` : base;
  const srcSet = widths.length > 1 ? widths.map((w) => `${fileFor(w)} ${w}w`).join(", ") : undefined;
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      alt={alt ?? image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={cn(placeholder && "bg-space-800", className)}
      style={
        placeholder && blur
          ? { backgroundImage: `url("${blur}")`, backgroundSize: "cover", backgroundPosition: "center", ...style }
          : style
      }
    />
  );
}

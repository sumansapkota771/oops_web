"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/components/ui/use-media-query";
import type { ImageData, VideoData } from "@/lib/types";
import { imageUrl } from "@/lib/media";

/** Muted, looping background video that only plays while visible and never autoplays for reduced-motion users. */
export function HeroVideo({ video, poster }: { video: VideoData | undefined; poster: ImageData | undefined }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const autoplay = !reduceMotion && !userPaused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!autoplay) {
      el.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplay]);

  if (!video) return null;
  const posterUrl = imageUrl(poster ?? video.poster, 1600);

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={video.src}
        poster={posterUrl}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (el.paused) {
            setUserPaused(false);
            el.play().catch(() => undefined);
          } else {
            setUserPaused(true);
            el.pause();
          }
        }}
        className="absolute bottom-6 right-4 z-20 flex min-h-11 items-center gap-2 rounded-full bg-space-950/60 px-4 text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur-md transition-colors hover:bg-space-950/80 sm:right-8"
        aria-label={playing ? "Pause background video" : "Play background video"}
      >
        {playing ? (
          <span className="flex gap-1" aria-hidden>
            <span className="h-3.5 w-1 rounded-full bg-current" />
            <span className="h-3.5 w-1 rounded-full bg-current" />
          </span>
        ) : (
          <PlayIcon size={16} weight="fill" aria-hidden />
        )}
        {playing ? "Pause" : "Play"}
      </button>
    </>
  );
}

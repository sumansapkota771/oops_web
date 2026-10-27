"use client";

import { useState } from "react";
import { Img } from "@/components/ui/img";
import { PlayIcon } from "@/components/ui/icons";
import type { ImageData, VideoData } from "@/lib/types";
import { imageUrl } from "@/lib/media";

function youtubeId(url: string) {
  const match = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url);
  return match?.[1];
}

/** Poster with a big play button; loads the video (or YouTube embed) only when asked. */
export function MoviePlayer({
  video,
  poster,
  youtubeUrl,
  title,
  aspect = "aspect-video",
}: {
  video: VideoData | undefined;
  poster: ImageData | undefined;
  youtubeUrl?: string;
  title: string;
  aspect?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const yt = youtubeUrl ? youtubeId(youtubeUrl) : undefined;
  const cover = poster ?? video?.poster;

  if (!video && !yt) return null;

  return (
    <div className={`relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-space-900 ${aspect}`}>
      {playing ? (
        yt ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={video!.src}
            poster={imageUrl(cover, 1600)}
            controls
            autoPlay
            playsInline
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Play video: ${title}`}
        >
          <Img image={cover} sizes="(min-width: 1024px) 70vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-space-950/35 transition-colors duration-500 group-hover:bg-space-950/20" aria-hidden />
          <span className="relative flex size-20 items-center justify-center rounded-full bg-yellow text-space-950 shadow-[0_0_0_12px_rgb(255_195_0/0.18),0_20px_60px_-10px_rgb(255_195_0/0.6)] transition-transform duration-500 ease-fluid group-hover:scale-110 sm:size-24">
            <PlayIcon size={34} weight="fill" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}

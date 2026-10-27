import { ArrowSquareOutIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function safeEmbed(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "www.google.com" || u.hostname === "maps.google.com") && u.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}

/** Google Maps embed tinted for the dark theme, with a link out to the full map. */
export function MapEmbed({ embedUrl, mapUrl, title, className }: { embedUrl: string; mapUrl: string; title: string; className?: string }) {
  return (
    <div className={cn("bezel h-full", className)}>
      <div className="bezel-core relative h-full min-h-[22rem]">
        {embedUrl && safeEmbed(embedUrl) ? (
          <iframe
            src={embedUrl}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)_brightness(0.95)]"
          />
        ) : null}
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-space-950/80 px-4 text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur-md hover:bg-space-950"
        >
          Open in Google Maps <ArrowSquareOutIcon size={16} aria-hidden />
        </a>
      </div>
    </div>
  );
}

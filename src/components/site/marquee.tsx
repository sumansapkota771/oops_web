import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless CSS marquee. Content is rendered twice; the copy is hidden from
 * assistive tech. Pauses on hover/focus and stops for reduced-motion users.
 */
export function Marquee({
  children,
  duration = 60,
  reverse = false,
  className,
  label,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("group mask-fade-x relative overflow-hidden", className)} role={label ? "region" : undefined} aria-label={label}>
      <div
        className={cn(
          "flex w-max motion-safe:group-hover:[animation-play-state:paused] motion-safe:group-focus-within:[animation-play-state:paused]",
          reverse ? "motion-safe:animate-marquee-reverse" : "motion-safe:animate-marquee",
        )}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 gap-4 pr-4">{children}</div>
        <div className="flex shrink-0 gap-4 pr-4" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}

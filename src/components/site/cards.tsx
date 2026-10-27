import Link from "next/link";
import { Img } from "@/components/ui/img";
import { Tilt } from "@/components/ui/tilt";
import { CalendarBlankIcon, StarIcon } from "@/components/ui/icons";
import { ACCENTS, ACCENT_VARS, accentFor } from "./accent";
import type { Attraction, Category, ImageData, Offer, Review } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type AttractionCardProps = {
  attraction: Attraction;
  category?: Category;
  image: ImageData | undefined;
  sizes?: string;
  className?: string;
  large?: boolean;
  priority?: boolean;
};

export function AttractionCard({ attraction, category, image, sizes = "(min-width: 1024px) 33vw, 100vw", className, large, priority }: AttractionCardProps) {
  const accent = ACCENTS[accentFor(category?.accent)];
  return (
    <Tilt className={cn("h-full", className)}>
    <Link href={`/attractions/${attraction.slug}`} className="group bezel block h-full" style={ACCENT_VARS[accentFor(category?.accent)]}>
      <div className={cn("bezel-core relative isolate flex h-full flex-col justify-end", large ? "min-h-[24rem] lg:min-h-[34rem]" : "min-h-[19rem]")}>
        <Img
          image={image}
          sizes={sizes}
          priority={priority}
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1400ms] ease-fluid group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-space-950 via-space-950/45 to-space-950/0" aria-hidden />
        <div className="flex flex-col gap-2 p-5 sm:p-6">
          {category ? (
            <span className={cn("w-fit rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]", accent.chip)}>
              {category.name}
            </span>
          ) : null}
          <h3 className={cn("heading", large ? "heading-md" : "heading-sm")}>{attraction.name}</h3>
          {attraction.tagline ? <p className="text-sm text-muted">{attraction.tagline}</p> : null}
        </div>
      </div>
    </Link>
    </Tilt>
  );
}

export function OfferCard({ offer, image, href, className }: { offer: Offer; image: ImageData | undefined; href: string; className?: string }) {
  const special = offer.kind === "special";
  return (
    <Tilt className={cn("h-full", className)}>
    <Link href={href} className="group bezel block h-full">
      <div className="bezel-core flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Img
            image={image}
            sizes="(min-width: 1024px) 26rem, 80vw"
            className="h-full w-full object-cover object-top transition-transform duration-[1400ms] ease-fluid group-hover:scale-[1.04]"
          />
          {special ? (
            <span className="absolute left-4 top-4 rounded-full bg-pink px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-space-950">
              Limited time
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          {offer.schedule ? (
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sea-300">
              <CalendarBlankIcon size={16} aria-hidden /> {offer.schedule}
            </p>
          ) : null}
          <h3 className="heading heading-sm">{offer.title}</h3>
          {offer.tagline ? <p className="text-sm text-muted">{offer.tagline}</p> : null}
          <div className="mt-auto flex items-end justify-between gap-4 pt-3">
            {offer.price_label ? (
              <p>
                <span className="block text-2xl font-extrabold text-yellow">{offer.price_label}</span>
                {offer.price_note ? <span className="text-xs uppercase tracking-wider text-subtle">{offer.price_note}</span> : null}
              </p>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </Link>
    </Tilt>
  );
}

const AVATAR = ["bg-sea-500", "bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-sea-700"];

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  const hash = [...review.author].reduce((n, c) => n + c.charCodeAt(0), 0);
  return (
    <figure className={cn("bezel break-inside-avoid", className)}>
      <div className="bezel-core flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn("flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white", AVATAR[hash % AVATAR.length])}
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
          <figcaption className="min-w-0">
            <span className="block truncate font-semibold">{review.author}</span>
            <span className="flex items-center gap-1.5 text-xs text-subtle">
              {review.badge ? (
                <>
                  {review.badge} ·{" "}
                </>
              ) : null}
              {review.date_label} · {review.source}
            </span>
          </figcaption>
        </div>
        <div className="flex gap-0.5" role="img" aria-label={`Rated ${review.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} size={18} weight="fill" className={i < review.rating ? "text-yellow" : "text-white/15"} aria-hidden />
          ))}
        </div>
        <blockquote className="text-[0.95rem] leading-relaxed text-ink/90">“{review.body}”</blockquote>
      </div>
    </figure>
  );
}

export function EventDate({ date, time }: { date: string | null; time: string | null }) {
  if (!date && !time) return null;
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sea-300">
      <CalendarBlankIcon size={16} aria-hidden />
      {[formatDate(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }), time].filter(Boolean).join(" · ")}
    </p>
  );
}

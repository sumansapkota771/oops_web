import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { CalendarBlankIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { ImageData, Offer } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { PosterLightbox } from "./poster-lightbox";

/** Full offer block for the Prices & Offers page. */
export function OfferDetail({ offer, poster, khaltiText, reverse = false }: { offer: Offer; poster: ImageData | undefined; khaltiText?: string; reverse?: boolean }) {
  const dateRange =
    offer.starts_on || offer.ends_on
      ? [formatDate(offer.starts_on, { day: "numeric", month: "short" }), formatDate(offer.ends_on, { day: "numeric", month: "short", year: "numeric" })]
          .filter(Boolean)
          .join(" – ")
      : "";
  const external = offer.cta_url && /^https?:/.test(offer.cta_url);
  return (
    <Reveal as="article" id={offer.slug} className="scroll-mt-32">
      <div className={cn("grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14", reverse && "lg:[&>*:first-child]:order-2")}>
        <div className="bezel lg:sticky lg:top-28">{poster ? <PosterLightbox image={poster} label={offer.title} /> : null}</div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {offer.kind === "special" ? (
              <span className="rounded-full bg-pink px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-space-950">Limited time</span>
            ) : null}
            {offer.schedule ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-sea-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sea-200">
                <CalendarBlankIcon size={15} aria-hidden /> {offer.schedule}
              </span>
            ) : null}
            {dateRange && !offer.schedule ? (
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">{dateRange}</span>
            ) : null}
          </div>
          <div>
            <h3 className="heading heading-md">{offer.title}</h3>
            {offer.tagline ? <p className="mt-3 text-lg text-muted">{offer.tagline}</p> : null}
          </div>

          {offer.options.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {offer.options.map((option) => (
                <li key={option.title + option.price} className="rounded-3xl bg-white/[0.04] p-5 hairline">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">{option.title}</p>
                  <p className="mt-2 text-2xl font-extrabold text-yellow">{option.price}</p>
                  {option.description ? <p className="mt-2 text-sm leading-relaxed text-muted">{option.description}</p> : null}
                </li>
              ))}
            </ul>
          ) : offer.price_label ? (
            <p className="flex items-baseline gap-3">
              <span className="text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-none text-yellow">{offer.price_label}</span>
              {offer.price_note ? <span className="text-sm uppercase tracking-wider text-subtle">{offer.price_note}</span> : null}
            </p>
          ) : null}

          {offer.inclusions.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Included</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {offer.inclusions.map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 text-sm hairline">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {offer.notes ? (
            <p className="flex gap-3 rounded-2xl bg-white/[0.03] p-4 text-sm leading-relaxed text-muted hairline">
                            <span>{offer.notes}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {offer.cta_url ? (
              external ? (
                <ButtonAnchor href={offer.cta_url} target="_blank" rel="noreferrer" variant="accent">
                  {offer.cta_label || "Learn more"}
                </ButtonAnchor>
              ) : (
                <ButtonLink href={offer.cta_url} variant="accent">
                  {offer.cta_label || "Learn more"}
                </ButtonLink>
              )
            ) : null}
            {offer.khalti && khaltiText ? (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#5c2d91]/40 px-4 text-xs font-semibold uppercase tracking-wider text-[#e3d1ff] hairline">
                {khaltiText}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

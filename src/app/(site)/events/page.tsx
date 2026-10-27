import { EventDate } from "@/components/site/cards";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { MoviePlayer } from "@/components/site/movie-player";
import { PageHero } from "@/components/site/page-hero";
import { PhotoGrid } from "@/components/site/photo-grid";
import { PosterLightbox } from "@/components/site/poster-lightbox";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { EnvelopeSimpleIcon, PhoneIcon } from "@/components/ui/icons";
import { Img } from "@/components/ui/img";
import { Reveal } from "@/components/ui/reveal";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/section";
import { getEventTypes, getMediaMap, getPage, getUpcomingEvents } from "@/lib/data";
import { toImage, toVideo } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { cn, telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("events", "/events");

export default async function EventsPage() {
  const [page, types, upcoming, media] = await Promise.all([getPage("events"), getEventTypes(), getUpcomingEvents(), getMediaMap()]);
  const c = page.content;

  return (
    <>
      <PageHero copy={c.hero} image={toImage(media, c.hero.image)}>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="#book" variant="accent">
            Book now
          </ButtonLink>
          <ButtonLink href="#upcoming" variant="ghost">
            {c.upcoming.title}
          </ButtonLink>
        </div>
      </PageHero>

      {types.map((type, index) => {
        const photos = type.images
          .map((p) => toImage(media, p))
          .filter((image) => image !== undefined)
          .slice(0, 16)
          .map((image) => ({ image }));
        const videos = type.videos.map((v) => toVideo(media, v)).filter((v) => v !== undefined);
        return (
          <Section key={type.id} id={type.slug} className="scroll-mt-24">
            <Container>
              <div className={cn("grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16")}>
                <Reveal className={cn("flex flex-col gap-6 lg:sticky lg:top-28", index % 2 === 1 && "lg:order-2")}>
                  <h2 className="heading heading-lg">{type.title}</h2>
                  {type.description ? <p className="text-base leading-relaxed text-ink/85 sm:text-lg">{type.description}</p> : null}
                  {type.highlights.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {type.highlights.map((h) => (
                        <li key={h} className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-2 text-sm font-medium hairline">
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink href="#book" variant="accent">
                      Enquire now
                    </ButtonLink>
                  </div>
                </Reveal>
                <div className="flex flex-col gap-4">
                  {videos.length ? (
                    <div className="grid grid-cols-2 gap-4">
                      {videos.map((video, i) => (
                        <Reveal variant="tilt" key={video.src} delay={i * 100} className="bezel">
                          <MoviePlayer video={video} poster={video.poster} title={`${type.title} video ${i + 1}`} aspect="aspect-[9/16]" />
                        </Reveal>
                      ))}
                    </div>
                  ) : null}
                  {photos.length ? (
                    <Reveal>
                      <PhotoGrid photos={photos} className="columns-2 sm:columns-2 lg:columns-2" />
                    </Reveal>
                  ) : null}
                </div>
              </div>
            </Container>
          </Section>
        );
      })}

      {/* BANQUET */}
      <Section id="banquet" className="scroll-mt-24">
        <Container>
          <div className="bezel">
            <div className="bezel-core grid lg:grid-cols-2">
              <div className="relative min-h-[18rem]">
                <Img image={toImage(media, c.banquet.image)} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <Reveal className="flex flex-col gap-6 p-8 sm:p-12">
                {c.banquet.eyebrow ? <Eyebrow>{c.banquet.eyebrow}</Eyebrow> : null}
                <h2 className="heading heading-md">{c.banquet.title}</h2>
                {c.banquet.subtitle ? <p className="leading-relaxed text-muted">{c.banquet.subtitle}</p> : null}
                <ul className="flex flex-wrap gap-2">
                  {c.banquet.points.map((p) => (
                    <li key={p} className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-2 text-sm font-medium hairline">
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* UPCOMING */}
      <Section id="upcoming" className="scroll-mt-24">
        <Container>
          <SectionHeading copy={c.upcoming} />
          {upcoming.length ? (
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => {
                const poster = toImage(media, event.poster_image);
                return (
                  <Reveal as="li" variant="tilt" key={event.id} delay={i * 100} className="bezel">
                    <article className="bezel-core flex h-full flex-col">
                      {poster ? <PosterLightbox image={poster} label={event.title} sizes="(min-width: 1024px) 33vw, 100vw" className="rounded-b-none" /> : null}
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <EventDate date={event.event_date} time={event.time_label} />
                        <h3 className="heading heading-sm">{event.title}</h3>
                        {event.description ? <p className="text-sm leading-relaxed text-muted">{event.description}</p> : null}
                        {event.cta_url ? (
                          <div className="mt-auto pt-3">
                            <ButtonAnchor href={event.cta_url} variant="ghost" {...(/^https?:/.test(event.cta_url) ? { target: "_blank", rel: "noreferrer" } : {})}>
                              {event.cta_label || "Learn more"}
                            </ButtonAnchor>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          ) : (
            <Reveal className="bezel mt-12">
              <div className="bezel-core flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:p-10">
                <p className="text-lg text-muted">{c.upcoming.emptyText}</p>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* BOOK NOW */}
      <Section id="book" className="scroll-mt-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="flex flex-col gap-8">
              <SectionHeading copy={c.booking} />
              <Reveal as="ul" className="flex flex-col gap-3">
                <li>
                  <a href={telHref(c.booking.phone)} className="flex min-h-16 items-center gap-4 rounded-3xl bg-white/[0.04] p-5 hairline hover:bg-white/[0.07]">
                    <PhoneIcon size={24} className="text-sea-300" aria-hidden />
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Call the events team</span>
                      <span className="text-lg font-semibold">{c.booking.phone}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${c.booking.email}`} className="flex min-h-16 items-center gap-4 rounded-3xl bg-white/[0.04] p-5 hairline hover:bg-white/[0.07]">
                    <EnvelopeSimpleIcon size={24} className="text-sea-300" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Email</span>
                      <span className="break-all text-lg font-semibold">{c.booking.email}</span>
                    </span>
                  </a>
                </li>
              </Reveal>
            </div>
            <Reveal className="bezel">
              <div className="bezel-core p-6 sm:p-10">
                <EnquiryForm source="events" successMessage={c.booking.successMessage} />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

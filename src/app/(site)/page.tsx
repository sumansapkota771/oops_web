import { AttractionCard, OfferCard, ReviewCard } from "@/components/site/cards";
import { CountUp } from "@/components/site/count-up";
import { HeroVideo } from "@/components/site/hero-video";
import { Highlight } from "@/components/site/highlight";
import { LogoTile } from "@/components/site/logo-tile";
import { MapEmbed } from "@/components/site/map-embed";
import { Marquee } from "@/components/site/marquee";
import { MoviePlayer } from "@/components/site/movie-player";
import { PhotoGrid } from "@/components/site/photo-grid";
import { PowerplayCard } from "@/components/site/powerplay-card";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { ClockIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { Img } from "@/components/ui/img";
import { Parallax } from "@/components/ui/parallax";
import { Reveal } from "@/components/ui/reveal";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/section";
import { getAttractions, getCategories, getGallery, getMediaMap, getOffers, getPage, getPowerplayTiers, getReviews, getSettings } from "@/lib/data";
import { toImage, toImages, toVideo } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { cn, telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("home", "/");

export default async function HomePage() {
  const [page, settings, media, attractions, categories, offers, tiers, reviews, gallery] = await Promise.all([
    getPage("home"),
    getSettings(),
    getMediaMap(),
    getAttractions(),
    getCategories(),
    getOffers(),
    getPowerplayTiers(),
    getReviews(),
    getGallery(),
  ]);
  const c = page.content;
  const pricesPage = await getPage("prices-offers");

  const categoryBySlug = new Map(categories.map((cat) => [cat.slug, cat]));
  const featured = (attractions.filter((a) => a.is_featured).length ? attractions.filter((a) => a.is_featured) : attractions).slice(0, 8);
  const heroPoster = toImage(media, c.hero.poster);
  const photos = toImages(media, c.photos.images).slice(0, 24);
  const half = Math.ceil(photos.length / 2);
  const hallOfFame = gallery.find((a) => a.layout === "people");
  const partners = gallery.find((a) => a.layout === "logos");
  const famous = (hallOfFame?.items ?? []).filter((i) => i.caption).slice(0, 10);
  const logos = (partners?.items ?? [])
    .map((i) => ({ image: toImage(media, i.image), name: i.caption }))
    .filter((l) => l.image)
    .slice(0, 48);
  const logoHalf = Math.ceil(logos.length / 2);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden pb-20 pt-40 sm:pb-24">
        <Parallax className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]" distance={8}>
          <Img image={heroPoster} priority sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
          <HeroVideo video={toVideo(media, c.hero.video)} poster={heroPoster} />
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/70 to-space-950/35" aria-hidden />
        </Parallax>
        <Container>
          <Reveal stagger className="flex max-w-6xl flex-col gap-7">
            {c.hero.eyebrow ? <Eyebrow>{c.hero.eyebrow}</Eyebrow> : null}
            <h1 className="heading heading-xl drop-shadow-[0_4px_30px_rgb(0_0_0/0.5)]">
              <Highlight text={c.hero.title} />
            </h1>
            {c.hero.subtitle ? <p className="max-w-2xl text-base leading-relaxed text-ink/85 sm:text-lg">{c.hero.subtitle}</p> : null}
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={c.hero.primaryCta.href}>{c.hero.primaryCta.label}</ButtonLink>
              <ButtonLink href={c.hero.secondaryCta.href} variant="ghost">
                {c.hero.secondaryCta.label}
              </ButtonLink>
            </div>
            {c.hero.chips.length ? (
              <ul className="flex flex-wrap gap-2">
                {c.hero.chips.map((chip) => (
                  <li key={chip} className="glass flex min-h-9 items-center gap-2 rounded-full px-4 text-xs font-medium uppercase tracking-wider text-ink/90">
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </Container>
      </section>

      {/* STATS */}
      <Section className="pb-10 sm:pb-14 lg:pb-16">
        <Container>
          <SectionHeading copy={c.stats} size="md" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {settings.stats.map((stat, i) => (
              <Reveal variant="tilt" key={stat.label} delay={i * 120} className="bezel">
                <div className="bezel-core relative overflow-hidden p-7 sm:p-9">
                                    <p className="heading whitespace-nowrap text-[clamp(2.4rem,3.7vw,3.7rem)] leading-none">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ATTRACTIONS */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading copy={c.attractions} />
            <Reveal>
              <ButtonLink href={c.attractions.cta.href} variant="orange">
                {c.attractions.cta.label}
              </ButtonLink>
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(19rem,auto)] lg:grid-cols-4">
            {featured.map((attraction, i) => (
              <Reveal
                as="li"
                variant="tilt" key={attraction.id}
                delay={(i % 4) * 90}
                className={cn(i === 0 && "sm:col-span-2 lg:row-span-2", i === 5 && "lg:col-span-2")}
              >
                <AttractionCard
                  attraction={attraction}
                  category={attraction.category_slug ? categoryBySlug.get(attraction.category_slug) : undefined}
                  image={toImage(media, attraction.cover_image)}
                  large={i === 0}
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
                />
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* OFFERS */}
      <Section className="overflow-hidden">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading copy={c.offers} />
            <Reveal>
              <ButtonLink href={c.offers.cta.href} variant="pink">
                {c.offers.cta.label}
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal>
            <ul className="no-scrollbar -mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
              <li className="w-[82vw] max-w-[22rem] shrink-0 snap-start sm:w-[22rem]">
                <PowerplayCard tiers={tiers} title={pricesPage.content.powerplay.title} subtitle={pricesPage.content.powerplay.subtitle} />
              </li>
              {offers.map((offer) => (
                <li key={offer.id} className="w-[82vw] max-w-[22rem] shrink-0 snap-start sm:w-[22rem]">
                  <OfferCard offer={offer} image={toImage(media, offer.poster_image)} href={`/prices-offers#${offer.slug}`} />
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      {/* MOVIE */}
      {c.movie.video || c.movie.youtubeUrl ? (
        <Section>
          <Container className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading copy={c.movie} />
            <Reveal className="bezel">
              <MoviePlayer
                video={toVideo(media, c.movie.video)}
                poster={toImage(media, c.movie.poster)}
                youtubeUrl={c.movie.youtubeUrl}
                title={c.movie.title}
              />
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* EVENTS */}
      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal variant="left" className="bezel order-2 lg:order-1">
            <div className="bezel-core relative aspect-[4/3]">
              <Img image={toImage(media, c.events.image)} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <div className="order-1 flex flex-col gap-8 lg:order-2">
            <SectionHeading copy={c.events} />
            <Reveal as="ul" className="grid gap-3 sm:grid-cols-2">
              {c.events.points.map((point) => (
                <li key={point} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 text-sm font-semibold uppercase tracking-wide hairline">
                  <span className="size-1.5 shrink-0 rotate-45 bg-yellow" aria-hidden /> {point}
                </li>
              ))}
            </Reveal>
            <Reveal className="flex flex-wrap gap-3">
              <ButtonLink href={c.events.cta.href} variant="accent">
                {c.events.cta.label}
              </ButtonLink>
              <ButtonLink href={settings.cta.book.href} variant="ghost">
                {settings.cta.book.label}
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* PHOTOS */}
      {photos.length ? (
        <Section className="overflow-hidden">
          <Container>
            <SectionHeading copy={c.photos} align="center" />
          </Container>
          <div className="mt-14 flex flex-col gap-4">
            {[photos.slice(0, half), photos.slice(half)].map((row, r) => (
              <Marquee key={r} duration={r ? 110 : 95} reverse={r === 1}>
                {row.map((photo, i) => (
                  <div key={`${photo.base}-${i}`} className="h-44 shrink-0 overflow-hidden rounded-3xl sm:h-60">
                    <Img image={photo} sizes="400px" placeholder={false} className="h-full w-auto object-cover" />
                  </div>
                ))}
              </Marquee>
            ))}
          </div>
        </Section>
      ) : null}

      {/* REVIEWS */}
      {reviews.length ? (
        <Section>
          <Container>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading copy={c.reviews}>
                {c.reviews.rating ? (
                  <p className="text-sm font-semibold uppercase tracking-wider text-yellow">★ {c.reviews.rating} on Google</p>
                ) : null}
              </SectionHeading>
              {c.reviews.googleUrl ? (
                <Reveal>
                  <ButtonAnchor href={c.reviews.googleUrl} target="_blank" rel="noreferrer" variant="green">
                    Review us on Google
                  </ButtonAnchor>
                </Reveal>
              ) : null}
            </div>
            <div className="mt-14 columns-1 gap-4 md:columns-2 lg:columns-3 [&>*]:mb-4">
              {reviews.map((review, i) => (
                <Reveal variant="tilt" key={review.id} delay={(i % 3) * 100} className="break-inside-avoid">
                  <ReviewCard review={review} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* HALL OF FAME */}
      {famous.length ? (
        <Section>
          <Container>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading copy={c.hallOfFame} />
              <Reveal>
                <ButtonLink href={c.hallOfFame.cta.href} variant="purple">
                  {c.hallOfFame.cta.label}
                </ButtonLink>
              </Reveal>
            </div>
            <Reveal className="mt-14">
              <PhotoGrid
                variant="strip"
                photos={famous.map((item) => ({ image: toImage(media, item.image)!, caption: item.caption })).filter((p) => p.image)}
              />
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* PARTNERS */}
      {logos.length ? (
        <Section className="overflow-hidden">
          <Container>
            <SectionHeading copy={c.partners} align="center" />
          </Container>
          <div className="mt-14 flex flex-col gap-4">
            {[logos.slice(0, logoHalf), logos.slice(logoHalf)].map((row, r) => (
              <Marquee key={r} duration={r ? 150 : 130} reverse={r === 1} label={r ? undefined : "Partner brands"}>
                {row.map((logo, i) => (
                  <LogoTile key={`${logo.image!.base}-${i}`} image={logo.image!} name={logo.name} />
                ))}
              </Marquee>
            ))}
          </div>
        </Section>
      ) : null}

      {/* VISIT */}
      <Section id="visit">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading copy={c.visit} />
            <Reveal as="ul" className="grid gap-3">
              <li className="flex gap-4 rounded-3xl bg-white/[0.04] p-5 hairline">
                <MapPinIcon size={24} className="shrink-0 text-sea-300" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Address</p>
                  <p className="mt-1 font-medium">
                    {settings.address.street}, {settings.address.city}, {settings.address.region}, {settings.address.country} ({settings.address.postalCode})
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-3xl bg-white/[0.04] p-5 hairline">
                <ClockIcon size={24} className="shrink-0 text-sea-300" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Opening hours</p>
                  <p className="mt-1 font-medium">
                    {settings.hours.label} · {settings.hours.note}
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-3xl bg-white/[0.04] p-5 hairline">
                <PhoneIcon size={24} className="shrink-0 text-sea-300" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Call us</p>
                  <p className="mt-1 flex flex-wrap gap-x-4 font-medium">
                    <a className="hover:text-sea-300" href={telHref(settings.contact.receptionPhone)}>
                      Reception {settings.contact.receptionPhone}
                    </a>
                    <a className="hover:text-sea-300" href={telHref(settings.contact.managementPhone)}>
                      Management {settings.contact.managementPhone}
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-3xl bg-white/[0.04] p-5 hairline">
                <EnvelopeSimpleIcon size={24} className="shrink-0 text-sea-300" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Email</p>
                  <p className="mt-1 flex flex-col font-medium break-all">
                    <a className="hover:text-sea-300" href={`mailto:${settings.contact.generalEmail}`}>
                      {settings.contact.generalEmail}
                    </a>
                    <a className="hover:text-sea-300" href={`mailto:${settings.contact.managementEmail}`}>
                      {settings.contact.managementEmail}
                    </a>
                  </p>
                </div>
              </li>
            </Reveal>
            <Reveal className="flex flex-wrap gap-3">
              <ButtonAnchor href={settings.address.mapUrl} target="_blank" rel="noreferrer">
                Get directions
              </ButtonAnchor>
              <ButtonLink href="/contact" variant="ghost">
                Contact us
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal className="min-h-[24rem]">
            <MapEmbed embedUrl={settings.address.mapEmbedUrl} mapUrl={settings.address.mapUrl} title={`Map: ${settings.brand.name}`} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

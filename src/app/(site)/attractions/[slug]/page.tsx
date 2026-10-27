import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACCENTS, accentFor } from "@/components/site/accent";
import { AttractionCard } from "@/components/site/cards";
import { PhotoGrid } from "@/components/site/photo-grid";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Img } from "@/components/ui/img";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { getAttraction, getAttractions, getCategories, getMediaMap } from "@/lib/data";
import { imageUrl, toImage } from "@/lib/media";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getAttractions()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/attractions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [attraction, media] = await Promise.all([getAttraction(slug), getMediaMap()]);
  if (!attraction) return { title: "Attraction not found" };
  const og = imageUrl(toImage(media, attraction.cover_image), 1600);
  return {
    title: `${attraction.name} in Kathmandu`,
    description: attraction.tagline ? `${attraction.tagline} ${attraction.description ?? ""}`.slice(0, 160) : attraction.description?.slice(0, 160),
    alternates: { canonical: `/attractions/${slug}` },
    openGraph: og ? { images: [{ url: og }] } : undefined,
  };
}

export default async function AttractionPage({ params }: PageProps<"/attractions/[slug]">) {
  // Resolved before anything streams, so an unknown slug returns a real 404 status.
  const { slug } = await params;
  const [attraction, attractions, categories, media] = await Promise.all([getAttraction(slug), getAttractions(), getCategories(), getMediaMap()]);
  if (!attraction) notFound();

  const category = categories.find((c) => c.slug === attraction.category_slug);
  const accent = ACCENTS[accentFor(category?.accent)];
  const cover = toImage(media, attraction.cover_image);
  const photos = attraction.images
    .filter((p) => p !== attraction.cover_image)
    .map((p) => toImage(media, p))
    .filter((image) => image !== undefined)
    .map((image) => ({ image }));
  const related = attractions.filter((a) => a.slug !== attraction.slug && a.category_slug === attraction.category_slug).slice(0, 3);
  const more = related.length >= 3 ? related : [...related, ...attractions.filter((a) => a.slug !== attraction.slug && !related.includes(a)).slice(0, 3 - related.length)];

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pt-44">
                <Container>
          <Link href="/attractions" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink">
            <ArrowLeftIcon size={16} aria-hidden /> All attractions
          </Link>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal className="flex flex-col gap-6">
              {category ? (
                <span className={cn("w-fit rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]", accent.chip)}>{category.name}</span>
              ) : null}
              <h1 className="heading heading-xl">{attraction.name}</h1>
              {attraction.tagline ? <p className={cn("text-xl font-semibold", accent.text)}>{attraction.tagline}</p> : null}
              {attraction.description ? <p className="max-w-xl text-base leading-relaxed text-ink/85 sm:text-lg">{attraction.description}</p> : null}
              {attraction.notes.length || attraction.grip_socks ? (
                <ul className="flex flex-col gap-2">
                  {attraction.notes.map((note) => (
                    <li key={note} className="flex gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-ink/85 hairline">
                      <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-yellow" aria-hidden />
                      {note}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/prices-offers">Prices & offers</ButtonLink>
                <ButtonLink href="/events#book" variant="ghost">
                  Book a party
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={120} className="bezel">
              <div className="bezel-core aspect-[4/3]">
                <Img image={cover} priority sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {photos.length ? (
        <Section className="pt-6">
          <Container>
            <h2 className="heading heading-md">Photos</h2>
            <Reveal className="mt-8">
              <PhotoGrid photos={photos} />
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {more.length ? (
        <Section className="pt-6">
          <Container>
            <h2 className="heading heading-md">More to explore</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((a, i) => (
                <Reveal as="li" variant="tilt" key={a.id} delay={i * 90}>
                  <AttractionCard
                    attraction={a}
                    category={categories.find((c) => c.slug === a.category_slug)}
                    image={toImage(media, a.cover_image)}
                  />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

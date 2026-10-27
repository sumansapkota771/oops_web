import { AttractionsBrowser } from "@/components/site/attractions-browser";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getAttractions, getCategories, getMediaMap, getPage } from "@/lib/data";
import { toImage } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("attractions", "/attractions");

export default async function AttractionsPage() {
  const [page, attractions, categories, media] = await Promise.all([getPage("attractions"), getAttractions(), getCategories(), getMediaMap()]);
  const { hero, safety } = page.content;
  const heroImage = toImage(media, attractions.find((a) => a.is_featured)?.cover_image ?? attractions[0]?.cover_image);

  return (
    <>
      <PageHero copy={hero} image={heroImage} />
      <Section className="pt-6 sm:pt-10">
        <Container>
          <AttractionsBrowser
            categories={categories}
            items={attractions.map((attraction) => ({ attraction, image: toImage(media, attraction.cover_image) }))}
          />
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="bezel">
            <div className="bezel-core grid gap-10 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <SectionHeading copy={safety} size="md" />
              <Reveal as="ul" className="flex flex-col gap-3">
                {safety.items.map((item) => (
                  <li key={item} className="flex gap-4 rounded-2xl bg-white/[0.04] p-4 text-sm leading-relaxed text-ink/90 hairline sm:text-base">
                    <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-green" aria-hidden />
                    {item}
                  </li>
                ))}
              </Reveal>
            </div>
          </div>
          <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/prices-offers">See prices & offers</ButtonLink>
            <ButtonLink href="/events#book" variant="ghost">
              Book an event
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

import { AttractionCard } from "@/components/site/cards";
import { CountUp } from "@/components/site/count-up";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getAttractions, getCategories, getMediaMap, getPage, getSettings } from "@/lib/data";
import { toImage, toImages } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("about", "/about");

export default async function AboutPage() {
  const [page, settings, media, attractions, categories] = await Promise.all([getPage("about"), getSettings(), getMediaMap(), getAttractions(), getCategories()]);
  const c = page.content;
  const collage = toImages(media, c.gallery.images).slice(0, 4);
  const facilities = attractions.filter((a) => a.category_slug === "food-facilities");
  const facilityCategory = categories.find((cat) => cat.slug === "food-facilities");

  return (
    <>
      <PageHero copy={c.hero} image={toImage(media, c.hero.image)} />

      <Section className="pt-8">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <h2 className="heading heading-lg">{c.story.title}</h2>
            {c.story.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="text-base leading-relaxed text-ink/85 sm:text-lg">
                {p}
              </p>
            ))}
          </Reveal>
          {collage.length ? (
            <Reveal delay={120} className="grid grid-cols-2 gap-3">
              {collage.map((image, i) => (
                <div key={image.base} className={cn("bezel", i % 2 === 1 && "translate-y-8")}>
                  <div className="bezel-core aspect-[4/5]">
                    <Img image={image} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </Reveal>
          ) : null}
        </Container>
      </Section>

      <Section className="pt-6">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {settings.stats.map((stat, i) => (
              <Reveal variant="tilt" key={stat.label} delay={i * 120} className="bezel">
                <div className="bezel-core p-8">
                  <p className="heading whitespace-nowrap text-[clamp(2.4rem,3.6vw,3.6rem)] leading-none">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-6">
        <Container className="grid gap-4 lg:grid-cols-2">
          {[
            { ...c.vision },
            { ...c.mission },
          ].map(({ title, body }, i) => (
            <Reveal variant="tilt" key={title} delay={i * 120} className="bezel">
              <div className="bezel-core relative flex h-full flex-col gap-5 overflow-hidden p-8 sm:p-12">
                <h2 className="heading heading-md">{title}</h2>
                <p className="text-lg leading-relaxed text-ink/85">{body}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section className="pt-6">
        <Container>
          <SectionHeading copy={c.audiences} align="center" />
          <Reveal as="ul" className="mt-10 flex flex-wrap justify-center gap-3">
            {c.audiences.items.map((item) => (
              <li key={item} className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white/[0.05] px-6 text-sm font-semibold uppercase tracking-wider hairline sm:text-base">
                {item}
              </li>
            ))}
          </Reveal>
        </Container>
      </Section>

      {facilities.length ? (
        <Section className="pt-6">
          <Container>
            <SectionHeading copy={c.facilities} />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((a, i) => (
                <Reveal as="li" variant="tilt" key={a.id} delay={(i % 3) * 90}>
                  <AttractionCard attraction={a} category={facilityCategory} image={toImage(media, a.cover_image)} />
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href="/attractions">Explore attractions</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Contact us
              </ButtonLink>
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

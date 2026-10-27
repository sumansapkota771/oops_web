import { PageHero } from "@/components/site/page-hero";
import { CheckIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { getPage, getPolicySections } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("terms", "/terms");

export default async function TermsPage() {
  const [page, sections] = await Promise.all([getPage("terms"), getPolicySections()]);
  const c = page.content;
  const groups = c.groups
    .map((g) => ({ ...g, sections: sections.filter((s) => s.group_key === g.key) }))
    .filter((g) => g.sections.length);

  return (
    <>
      <PageHero copy={c.hero}>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-2">
          {groups.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="inline-flex min-h-11 items-center rounded-full bg-white/[0.06] px-5 text-xs font-semibold uppercase tracking-wider hairline hover:bg-white/[0.12]">
              {g.title}
            </a>
          ))}
        </nav>
      </PageHero>
      <Section className="pt-2">
        <Container className="max-w-4xl">
          {c.intro ? <p className="text-lg leading-relaxed text-ink/85">{c.intro}</p> : null}
          <div className="mt-12 flex flex-col gap-16">
            {groups.map((group) => (
              <section key={group.key} id={group.key} className="scroll-mt-28">
                <h2 className="heading heading-lg">{group.title}</h2>
                <div className="mt-8 grid gap-4">
                  {group.sections.map((section) => (
                    <Reveal variant="tilt" key={section.id} className="bezel">
                      <div className="bezel-core p-6 sm:p-8">
                        <h3 className="heading heading-sm text-sea-200">{section.title}</h3>
                        <ul className="mt-4 flex flex-col gap-3">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-3 leading-relaxed text-ink/85">
                              <CheckIcon size={18} weight="bold" className="mt-1 shrink-0 text-sea-300" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

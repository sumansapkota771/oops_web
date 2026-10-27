import { FaqList } from "@/components/site/faq-list";
import { PageHero } from "@/components/site/page-hero";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section } from "@/components/ui/section";
import { getFaqs, getPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("faq", "/faq");

export default async function FaqPage() {
  const [page, faqs, settings] = await Promise.all([getPage("faq"), getFaqs(), getSettings()]);
  const c = page.content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero copy={c.hero} />
      <Section className="pt-4">
        <Container className="max-w-4xl">
          <Reveal>
            <FaqList faqs={faqs} />
          </Reveal>
          <Reveal className="bezel mt-14">
            <div className="bezel-core flex flex-col gap-6 p-8 sm:p-10">
              <h2 className="heading heading-md">{c.cta.title}</h2>
              {c.cta.subtitle ? <p className="text-muted">{c.cta.subtitle}</p> : null}
              <div className="flex flex-wrap gap-3">
                <ButtonAnchor href={telHref(settings.contact.receptionPhone)} variant="green">Call {settings.contact.receptionPhone}</ButtonAnchor>
                <ButtonLink href="/contact" variant="ghost">
                  Send a message
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

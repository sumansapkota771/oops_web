import { OfferDetail } from "@/components/site/offer-detail";
import { PageHero } from "@/components/site/page-hero";
import { PosterLightbox } from "@/components/site/poster-lightbox";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getMediaMap, getOffers, getPage, getPowerplayTiers } from "@/lib/data";
import { toImage } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { cn, formatNumber } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("prices-offers", "/prices-offers");

export default async function PricesPage() {
  const [page, offers, tiers, media] = await Promise.all([getPage("prices-offers"), getOffers(), getPowerplayTiers(), getMediaMap()]);
  const c = page.content;
  const regular = offers.filter((o) => o.kind === "regular");
  const special = offers.filter((o) => o.kind === "special");
  const poster = toImage(media, c.powerplay.poster);

  return (
    <>
      <PageHero copy={c.hero}>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-2">
          {[
            { href: "#powerplay", label: c.powerplay.title },
            { href: "#all-day-deals", label: c.regular.title },
            { href: "#other-offers", label: c.special.title },
          ].map((l) => (
            <a key={l.href} href={l.href} className="inline-flex min-h-11 items-center rounded-full bg-white/[0.06] px-5 text-xs font-semibold uppercase tracking-wider hairline hover:bg-white/[0.12]">
              {l.label}
            </a>
          ))}
        </nav>
      </PageHero>

      {c.facts.length ? (
        <Container>
          <Reveal as="ul" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {c.facts.map((fact) => (
              <li key={fact.label} className="bezel">
                <div className="bezel-core p-5 sm:p-6">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-subtle">{fact.label}</p>
                  <p className="mt-2 text-lg font-bold sm:text-xl">{fact.value}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </Container>
      ) : null}

      {/* POWERPLAY */}
      <Section id="powerplay" className="scroll-mt-24">
        <Container>
          <SectionHeading copy={c.powerplay} />
          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
            <Reveal className="bezel">
              <div className="bezel-core overflow-x-auto p-2 sm:p-4">
                <table className="w-full min-w-[22rem] border-separate border-spacing-y-2 text-left">
                  <caption className="sr-only">{c.powerplay.title}: recharge amounts, credits and bonus</caption>
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-[0.18em] text-subtle sm:text-xs">
                      <th scope="col" className="px-3 py-2 font-semibold sm:px-5">{c.powerplay.columns.pay}</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold sm:px-5">{c.powerplay.columns.credits}</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold sm:px-5">{c.powerplay.columns.bonus}</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold sm:px-5">{c.powerplay.columns.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => (
                      <tr key={tier.id} className={cn("text-sm tabular-nums sm:text-lg", tier.is_highlight ? "text-space-950" : "text-ink")}>
                        <th
                          scope="row"
                          className={cn(
                            "rounded-l-2xl px-3 py-4 font-bold sm:px-5",
                            tier.is_highlight ? "bg-yellow" : "bg-sea-400/15 text-sea-100",
                          )}
                        >
                          Rs. {formatNumber(tier.pay)}
                        </th>
                        <td className={cn("px-3 py-4 text-right font-semibold sm:px-5", tier.is_highlight ? "bg-yellow" : "bg-white/[0.04]")}>
                          {formatNumber(tier.credits)}
                        </td>
                        <td className={cn("px-3 py-4 text-right font-semibold sm:px-5", tier.is_highlight ? "bg-yellow" : "bg-white/[0.04] text-[#9be05c]")}>
                          {tier.bonus ? `+${formatNumber(tier.bonus)}` : "—"}
                        </td>
                        <td className={cn("rounded-r-2xl px-3 py-4 text-right font-extrabold sm:px-5", tier.is_highlight ? "bg-yellow" : "bg-green/20 text-[#c9f29d]")}>
                          {formatNumber(tier.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <div className="flex flex-col gap-6">
              {poster ? (
                <Reveal className="bezel">
                  <PosterLightbox image={poster} label={c.powerplay.title} sizes="(min-width: 1024px) 30vw, 100vw" />
                </Reveal>
              ) : null}
              {c.powerplay.terms.length ? (
                <Reveal className="bezel">
                  <div className="bezel-core p-6">
                    <h3 className="heading text-sm tracking-[0.16em] text-sea-300">Terms & conditions</h3>
                    <ul className="mt-4 flex flex-col gap-2.5 text-sm leading-relaxed text-muted">
                      {c.powerplay.terms.map((term) => (
                        <li key={term} className="flex gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-sea-300" aria-hidden />
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* ALL-DAY DEALS */}
      {regular.length ? (
        <Section id="all-day-deals" className="scroll-mt-24">
          <Container>
            <SectionHeading copy={c.regular} />
            <div className="mt-14 flex flex-col gap-20 lg:gap-28">
              {regular.map((offer, i) => (
                <OfferDetail key={offer.id} offer={offer} poster={toImage(media, offer.poster_image)} khaltiText={c.khalti.enabled ? c.khalti.text : undefined} reverse={i % 2 === 1} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* OTHER OFFERS */}
      <Section id="other-offers" className="scroll-mt-24">
        <Container>
          <SectionHeading copy={c.special} />
          {special.length ? (
            <div className="mt-14 flex flex-col gap-20 lg:gap-28">
              {special.map((offer, i) => (
                <OfferDetail key={offer.id} offer={offer} poster={toImage(media, offer.poster_image)} khaltiText={c.khalti.enabled ? c.khalti.text : undefined} reverse={i % 2 === 1} />
              ))}
            </div>
          ) : (
            <Reveal className="bezel mt-12">
              <div className="bezel-core flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:p-10">
                <p className="text-lg text-muted">{c.special.emptyText}</p>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <Reveal className="bezel">
            <div className="bezel-core relative flex flex-col items-start gap-6 overflow-hidden p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
                            <p className="heading heading-sm max-w-xl">Planning a birthday or group visit? Ask about our event packages.</p>
              <ButtonLink href="/events#book" variant="accent">
                Book an event
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

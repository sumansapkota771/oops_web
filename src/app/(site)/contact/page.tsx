import { EnquiryForm } from "@/components/site/enquiry-form";
import { MapEmbed } from "@/components/site/map-embed";
import { PageHero } from "@/components/site/page-hero";
import { ClockIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon, SocialIcon, SOCIAL_LABEL } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("contact", "/contact");

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSettings()]);
  const { contact, address, hours, socials, brand } = settings;
  const c = page.content;

  const cards = [
    { icon: PhoneIcon, label: "Reception", value: contact.receptionPhone, href: telHref(contact.receptionPhone) },
    { icon: PhoneIcon, label: "Management", value: contact.managementPhone, href: telHref(contact.managementPhone) },
    { icon: EnvelopeSimpleIcon, label: "Email (general)", value: contact.generalEmail, href: `mailto:${contact.generalEmail}` },
    { icon: EnvelopeSimpleIcon, label: "Email (management)", value: contact.managementEmail, href: `mailto:${contact.managementEmail}` },
    { icon: ClockIcon, label: "Opening hours", value: `${hours.label} · ${hours.note}` },
    {
      icon: MapPinIcon,
      label: "Address",
      value: `${address.street}, ${address.city}, ${address.region}, ${address.country} (${address.postalCode})`,
      href: address.mapUrl,
      external: true,
    },
  ];

  return (
    <>
      <PageHero copy={c.hero} />

      <Container>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href, external }, i) => {
            const body = (
              <div className="bezel-core flex h-full gap-4 p-6">
                <Icon size={26} className="shrink-0 text-sea-300" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">{label}</p>
                  <p className="mt-1.5 break-words text-base font-semibold sm:text-lg">{value}</p>
                </div>
              </div>
            );
            return (
              <Reveal as="li" variant="tilt" key={label} delay={(i % 3) * 80} className="bezel">
                {href ? (
                  <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="block h-full rounded-[calc(2rem-0.375rem)] transition-colors hover:bg-white/[0.03]">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </Reveal>
            );
          })}
        </ul>
      </Container>

      <Section>
        <Container className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-8">
            <SectionHeading copy={c.form} size="md" />
            <Reveal className="bezel">
              <div className="bezel-core p-6 sm:p-10">
                <EnquiryForm source="contact" successMessage={c.form.successMessage} />
              </div>
            </Reveal>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">Follow {brand.name}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.platform}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.05] px-4 text-sm font-medium hairline hover:bg-white/[0.1]"
                    >
                      <SocialIcon platform={s.platform} size={18} /> {SOCIAL_LABEL[s.platform]}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="min-h-[28rem]">
            <MapEmbed embedUrl={address.mapEmbedUrl} mapUrl={address.mapUrl} title={`Map: ${brand.name}`} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

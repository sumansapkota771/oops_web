import Link from "next/link";
import { Img } from "@/components/ui/img";
import { ClockIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon, SocialIcon, SOCIAL_LABEL } from "@/components/ui/icons";
import { Container } from "@/components/ui/section";
import type { ImageData, SiteSettings } from "@/lib/types";
import { telHref } from "@/lib/utils";

export function Footer({ settings, logo, year }: { settings: SiteSettings; logo: ImageData | undefined; year: number }) {
  const { contact, address, hours, socials, footer, nav, brand } = settings;
  return (
    <footer className="relative mt-10 border-t border-white/[0.07] bg-space-950/70 pb-10 pt-20">
      <div className="absolute inset-x-0 top-0 flex h-1.5" aria-hidden>
        {["bg-orange", "bg-yellow", "bg-green", "bg-sea-400", "bg-purple", "bg-pink"].map((c) => (
          <span key={c} className={`flex-1 ${c}`} />
        ))}
      </div>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label={`${brand.name} — home`} className="w-fit">
              <Img image={logo} sizes="200px" placeholder={false} className="h-16 w-auto" alt={brand.name} />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted">{footer.blurb}</p>
            <ul className="flex flex-wrap gap-2" aria-label="Social media">
              {socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${SOCIAL_LABEL[s.platform]} (opens in a new tab)`}
                    className="flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-ink transition-colors duration-300 hover:bg-sea-400 hover:text-space-950"
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="heading heading-sm text-sm tracking-[0.18em] text-sea-300">Explore</h2>
            <ul className="mt-5 flex flex-col gap-1">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-9 items-center text-sm text-muted transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="heading heading-sm text-sm tracking-[0.18em] text-sea-300">Visit</h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-muted">
              <li className="flex gap-3">
                <MapPinIcon size={20} className="mt-0.5 shrink-0 text-sea-300" aria-hidden />
                <a href={address.mapUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {address.street}, {address.city}
                  <br />
                  {address.region}, {address.country} ({address.postalCode})
                </a>
              </li>
              <li className="flex gap-3">
                <ClockIcon size={20} className="mt-0.5 shrink-0 text-sea-300" aria-hidden />
                <span>
                  {hours.label}
                  <br />
                  {hours.note}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="heading heading-sm text-sm tracking-[0.18em] text-sea-300">Contact</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-muted">
              <li className="flex gap-3">
                <PhoneIcon size={20} className="mt-0.5 shrink-0 text-sea-300" aria-hidden />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-subtle">Reception</span>
                  <a href={telHref(contact.receptionPhone)} className="hover:text-white">
                    {contact.receptionPhone}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon size={20} className="mt-0.5 shrink-0 text-sea-300" aria-hidden />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-subtle">Management</span>
                  <a href={telHref(contact.managementPhone)} className="hover:text-white">
                    {contact.managementPhone}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <EnvelopeSimpleIcon size={20} className="mt-0.5 shrink-0 text-sea-300" aria-hidden />
                <span className="flex flex-col gap-1 break-all">
                  <a href={`mailto:${contact.generalEmail}`} className="hover:text-white">
                    {contact.generalEmail}
                  </a>
                  <a href={`mailto:${contact.managementEmail}`} className="hover:text-white">
                    {contact.managementEmail}
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.07] pt-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright.replace("{year}", String(year))}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-9 items-center uppercase tracking-wider hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

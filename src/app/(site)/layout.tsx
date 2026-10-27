import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Starfield } from "@/components/space/starfield";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { currentYear, getMediaMap, getSettings } from "@/lib/data";
import { imageUrl, toImage } from "@/lib/media";
import { todayInNepal } from "@/lib/utils";
import { cacheLife } from "next/cache";

async function activeAnnouncement() {
  "use cache";
  cacheLife("hours");
  const { announcement } = await getSettings();
  if (!announcement.enabled || !announcement.text) return null;
  if (announcement.until && announcement.until < todayInNepal()) return null;
  return { text: announcement.text, href: announcement.href };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, media, year, announcement] = await Promise.all([
    getSettings(),
    getMediaMap(),
    currentYear(),
    activeAnnouncement(),
  ]);
  const logo = toImage(media, settings.brand.logo, settings.brand.name);
  const site = settings.seo.siteUrl.replace(/\/$/, "");
  const absolute = (url?: string) => (url && url.startsWith("/") ? `${site}${url}` : url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    "@id": `${site}/#business`,
    name: settings.brand.name,
    url: site,
    logo: absolute(imageUrl(logo, 640)),
    image: absolute(imageUrl(toImage(media, settings.seo.ogImage), 1600)),
    description: settings.seo.description,
    telephone: settings.contact.receptionPhone,
    email: settings.contact.generalEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.street,
      addressLocality: settings.address.city,
      addressRegion: settings.address.region,
      postalCode: settings.address.postalCode,
      addressCountry: "NP",
    },
    hasMap: settings.address.mapUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: settings.hours.opens,
        closes: settings.hours.closes,
      },
    ],
    sameAs: settings.socials.map((s) => s.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Starfield />
      <SmoothScroll />
      <Header
        nav={settings.nav}
        cta={settings.cta}
        phone={settings.contact.receptionPhone}
        hours={settings.hours.label}
        socials={settings.socials}
        logo={logo}
        brandName={settings.brand.name}
        announcement={announcement}
      />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer settings={settings} logo={logo} year={year} />
    </>
  );
}

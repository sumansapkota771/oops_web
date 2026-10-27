/** A reference to a file in the media library, e.g. "attractions/trampoline/dsc07065". */
export type MediaPath = string;

export type Link = { label: string; href: string };

export type SectionCopy = { eyebrow?: string; title: string; subtitle?: string };

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube" | "tripadvisor" | "x" | "whatsapp";

export type Stat = { value: number; suffix?: string; label: string };

export type SiteSettings = {
  brand: { name: string; shortName: string; tagline: string; logo: MediaPath; logoDark: MediaPath };
  announcement: { enabled: boolean; text: string; href?: string; until?: string };
  contact: {
    receptionPhone: string;
    managementPhone: string;
    generalEmail: string;
    managementEmail: string;
    whatsapp?: string;
  };
  hours: { label: string; note: string; opens: string; closes: string };
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    mapUrl: string;
    mapEmbedUrl: string;
    latitude?: number;
    longitude?: number;
  };
  socials: Array<{ platform: SocialPlatform; url: string; handle?: string }>;
  stats: Stat[];
  nav: Link[];
  cta: { book: Link; callLabel: string };
  footer: { blurb: string; copyright: string; links: Link[] };
  seo: { siteUrl: string; title: string; titleTemplate: string; description: string; ogImage: MediaPath; keywords: string[] };
};

export type HomeContent = {
  hero: SectionCopy & { primaryCta: Link; secondaryCta: Link; video: MediaPath; poster: MediaPath; chips: string[] };
  stats: SectionCopy;
  attractions: SectionCopy & { cta: Link };
  offers: SectionCopy & { cta: Link };
  movie: SectionCopy & { video: MediaPath; poster: MediaPath; youtubeUrl?: string };
  events: SectionCopy & { cta: Link; image: MediaPath; points: string[] };
  photos: SectionCopy & { images: MediaPath[] };
  reviews: SectionCopy & { rating: string; googleUrl: string };
  hallOfFame: SectionCopy & { cta: Link };
  partners: SectionCopy;
  visit: SectionCopy;
};

export type AboutContent = {
  hero: SectionCopy & { image: MediaPath };
  story: { title: string; paragraphs: string[] };
  vision: { title: string; body: string };
  mission: { title: string; body: string };
  audiences: SectionCopy & { items: string[] };
  facilities: SectionCopy;
  gallery: { images: MediaPath[] };
};

export type AttractionsContent = { hero: SectionCopy; safety: SectionCopy & { items: string[] } };

export type PricesContent = {
  hero: SectionCopy;
  powerplay: SectionCopy & { poster: MediaPath; terms: string[]; columns: { pay: string; credits: string; bonus: string; total: string } };
  facts: Array<{ label: string; value: string }>;
  regular: SectionCopy;
  special: SectionCopy & { emptyText: string };
  khalti: { enabled: boolean; text: string };
};

export type EventsContent = {
  hero: SectionCopy & { image: MediaPath };
  upcoming: SectionCopy & { emptyText: string };
  banquet: SectionCopy & { image: MediaPath; points: string[] };
  booking: SectionCopy & { phone: string; email: string; successMessage: string };
};

export type GalleryContent = { hero: SectionCopy };
export type ContactContent = { hero: SectionCopy; form: SectionCopy & { successMessage: string } };
export type FaqContent = { hero: SectionCopy; cta: SectionCopy };
export type TermsContent = { hero: SectionCopy; intro: string; groups: Array<{ key: string; title: string }> };

export type PageContentMap = {
  home: HomeContent;
  about: AboutContent;
  attractions: AttractionsContent;
  "prices-offers": PricesContent;
  events: EventsContent;
  gallery: GalleryContent;
  contact: ContactContent;
  faq: FaqContent;
  terms: TermsContent;
};

export type PageSlug = keyof PageContentMap;

export type Page<S extends PageSlug = PageSlug> = {
  slug: S;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: MediaPath | null;
  content: PageContentMap[S];
};

type Row = { id: string; sort: number; is_visible: boolean };

export type Category = Row & { slug: string; name: string; description: string | null; accent: Accent };

export type Accent = "sea" | "orange" | "yellow" | "green" | "pink" | "purple";

export type Attraction = Row & {
  slug: string;
  name: string;
  category_slug: string | null;
  tagline: string | null;
  description: string | null;
  cover_image: MediaPath | null;
  images: MediaPath[];
  notes: string[];
  grip_socks: boolean;
  is_featured: boolean;
};

export type OfferOption = { title: string; price: string; description: string };

export type Offer = Row & {
  slug: string;
  kind: "regular" | "special";
  title: string;
  tagline: string | null;
  schedule: string | null;
  price_label: string | null;
  price_note: string | null;
  options: OfferOption[];
  inclusions: string[];
  notes: string | null;
  poster_image: MediaPath | null;
  wide_image: MediaPath | null;
  starts_on: string | null;
  ends_on: string | null;
  khalti: boolean;
  cta_label: string | null;
  cta_url: string | null;
};

export type PowerplayTier = Row & { pay: number; credits: number; bonus: number; total: number; is_highlight: boolean };

export type EventType = Row & {
  slug: string;
  title: string;
  description: string | null;
  highlights: string[];
  cover_image: MediaPath | null;
  images: MediaPath[];
  videos: MediaPath[];
};

export type UpcomingEvent = Row & {
  title: string;
  event_date: string | null;
  time_label: string | null;
  description: string | null;
  poster_image: MediaPath | null;
  cta_label: string | null;
  cta_url: string | null;
};

export type GalleryAlbum = Row & { slug: string; title: string; description: string | null; layout: "photos" | "people" | "logos" };

export type GalleryItem = Row & { album_slug: string; image: MediaPath; caption: string | null };

export type Review = Row & {
  author: string;
  rating: number;
  body: string;
  date_label: string | null;
  source: string;
  badge: string | null;
};

export type Faq = Row & { question: string; answer: string };

export type PolicySection = Row & { group_key: string; title: string; items: string[] };

export type MediaRecord = {
  id?: string;
  path: MediaPath;
  bucket?: string;
  kind: "image" | "svg" | "video" | "file";
  ext: string;
  widths: number[];
  width: number | null;
  height: number | null;
  bytes: number;
  blur: string | null;
  alt: string | null;
  folder: string;
  name: string | null;
  poster: MediaPath | null;
  duration: number | null;
  created_at?: string;
};

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

/** Everything an <Img> needs, resolved on the server. */
export type ImageData = {
  base: string;
  ext: string;
  widths: number[];
  width: number;
  height: number;
  blur?: string;
  alt: string;
};

export type VideoData = { src: string; poster?: ImageData; width: number; height: number };

/**
 * Initial website content, transcribed from the client's documents and posters.
 * `pnpm db:seed` writes all of this into Supabase; after that, every word and
 * image is edited from /admin. Until Supabase keys are configured the site
 * renders directly from this file.
 */
import type {
  Attraction,
  Category,
  EventType,
  Faq,
  GalleryAlbum,
  GalleryItem,
  Offer,
  Page,
  PageContentMap,
  PageSlug,
  PolicySection,
  PowerplayTier,
  Review,
  SiteSettings,
  UpcomingEvent,
} from "@/lib/types";
import { brandName, fromSource, personName, rawMedia, seedMedia } from "./media";

const row = (key: string, sort: number) => ({ id: `seed-${key}`, sort, is_visible: true });

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export const settings: SiteSettings = {
  brand: { name: "OOPS! Nepal", shortName: "OOPS!", tagline: "I Like It", logo: "brand/logo-white", logoDark: "brand/logo-black" },
  announcement: {
    enabled: true,
    text: "Dashain ko 20 Taps Dhamaka — any 20 taps for NPR 1,299 · Oct 18–23",
    href: "/prices-offers#other-offers",
    until: "2026-10-23",
  },
  contact: {
    receptionPhone: "+977 9851340905",
    managementPhone: "+977 9767356014",
    generalEmail: "info.oopsnepal@gmail.com",
    managementEmail: "marketing.oops.np@gmail.com",
    whatsapp: "",
  },
  hours: { label: "11 AM – 8 PM", note: "Open daily, including public holidays", opens: "11:00", closes: "20:00" },
  address: {
    street: "Dhumbarahi Pipalbot",
    city: "Kathmandu",
    region: "Bagmati Province",
    postalCode: "44600",
    country: "Nepal",
    mapUrl: "https://maps.app.goo.gl/7TP3Bv2yPSGGaB9M7",
    mapEmbedUrl: "https://www.google.com/maps?q=OOPS!%20Nepal%2C%20Dhumbarahi%20Pipalbot%2C%20Kathmandu&output=embed",
  },
  socials: [
    { platform: "instagram", url: "https://www.instagram.com/oopsinnepal", handle: "@oopsinnepal" },
    { platform: "facebook", url: "https://www.facebook.com/oopsinnepal", handle: "oopsinnepal" },
    { platform: "tiktok", url: "https://www.tiktok.com/@oopsinnepal", handle: "@oopsinnepal" },
    { platform: "youtube", url: "https://www.youtube.com/@oopsnp", handle: "@oopsnp" },
    { platform: "tripadvisor", url: "https://www.tripadvisor.com/Profile/oopsinnepal", handle: "oopsinnepal" },
  ],
  stats: [
    { value: 25000, suffix: "+", label: "Average footfall every month" },
    { value: 100000, suffix: "+", label: "Customers so far" },
    { value: 100, suffix: "+", label: "Games & activities" },
  ],
  nav: [
    { label: "Home", href: "/" },
    { label: "Attractions", href: "/attractions" },
    { label: "Prices & Offers", href: "/prices-offers" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { book: { label: "Book Now", href: "/events#book" }, callLabel: "Call us" },
  footer: {
    blurb: "Nepal’s first Family Entertainment Centre — 100+ games & activities under one roof in Dhumbarahi, Kathmandu.",
    copyright: "© {year} OOPS! Nepal. All rights reserved.",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Rules & terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
  seo: {
    siteUrl: "https://www.oopsnp.com",
    title: "OOPS! Nepal — Nepal’s First Family Entertainment Centre",
    titleTemplate: "%s | OOPS! Nepal",
    description:
      "Nepal’s first Family Entertainment Centre in Dhumbarahi, Kathmandu — 100+ games & activities: trampoline, zipline, bowling, VR, arcade, wall climbing, bumper cars, soft play and more. Open daily 11 AM – 8 PM.",
    ogImage: "home/hero-loop-poster",
    keywords: [
      "OOPS Nepal",
      "family entertainment centre Kathmandu",
      "trampoline park Kathmandu",
      "bowling Kathmandu",
      "arcade Kathmandu",
      "birthday party venue Kathmandu",
      "things to do in Kathmandu",
    ],
  },
};

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const homePhotos = fromSource("Homepage/Photos");

const content: PageContentMap = {
  home: {
    hero: {
      eyebrow: "Dhumbarahi · Kathmandu",
      title: "Nepal’s first Family Entertainment Centre with *100+ games & activities*",
      subtitle:
        "Trampoline, zipline, bowling, VR, arcade, wall climbing, bumper cars, soft play and so much more — all under one roof.",
      primaryCta: { label: "Explore attractions", href: "/attractions" },
      secondaryCta: { label: "See offers", href: "/prices-offers" },
      video: "home/hero-loop",
      poster: "home/hero-loop-poster",
      chips: ["Open daily · 11 AM – 8 PM", "No entry fee", "Parking available"],
    },
    stats: { eyebrow: "By the numbers", title: "The fun keeps *growing*" },
    attractions: {
      eyebrow: "100+ games & activities",
      title: "Explore the attractions",
      subtitle: "From high-flying adventure to arcade legends — there is something for every age.",
      cta: { label: "View all attractions", href: "/attractions" },
    },
    offers: {
      eyebrow: "Prices & offers",
      title: "Play more, pay less",
      subtitle: "Load your OOPS! card with a Powerplay bonus or grab one of our all-day deals.",
      cta: { label: "All prices & offers", href: "/prices-offers" },
    },
    movie: {
      eyebrow: "Watch",
      title: "Step inside OOPS!",
      subtitle: "Take a 90-second tour of Nepal’s first Family Entertainment Centre.",
      video: "home/oops-movie",
      poster: "home/oops-movie-poster",
      youtubeUrl: "",
    },
    events: {
      eyebrow: "Parties & events",
      title: "Celebrate the OOPS! way",
      subtitle:
        "Birthday parties, school outings, corporate tournaments and brand activations — planned and run by our professional events team.",
      cta: { label: "Plan your event", href: "/events" },
      image: "events/social/2-2",
      points: ["Birthday parties", "School outings", "Corporate events", "Bowling tournaments"],
    },
    photos: { eyebrow: "Moments", title: "Smiles from every corner", images: homePhotos },
    reviews: {
      eyebrow: "Google reviews",
      title: "Loved by families in Kathmandu",
      subtitle: "Here is what our guests say about their visit.",
      rating: "",
      googleUrl: "https://maps.app.goo.gl/7TP3Bv2yPSGGaB9M7",
    },
    hallOfFame: {
      eyebrow: "Hall of Fame",
      title: "Stars who played at OOPS!",
      subtitle: "Celebrities, artists and creators who joined the fun.",
      cta: { label: "Open the gallery", href: "/gallery#hall-of-fame" },
    },
    partners: {
      eyebrow: "Partner brands",
      title: "Brands that played with us",
      subtitle: "Brands, schools, colleges and embassies that have celebrated, competed and activated at OOPS!",
    },
    visit: {
      eyebrow: "Visit us",
      title: "Plan your visit",
      subtitle: "Open every day from 11 AM to 8 PM, including public holidays.",
    },
  },
  about: {
    hero: {
      eyebrow: "About OOPS!",
      title: "One roof. *100+ ways* to play.",
      subtitle: "One of Nepal’s first Family Entertainment Centers, in Dhumbarahi, Kathmandu.",
      image: "home/photos/dsc-7829",
    },
    story: {
      title: "About us",
      paragraphs: [
        "OOPS! is one of Nepal’s first Family Entertainment Centers (FECs), offering 100+ games and activities under one roof. Located in Dhumbarahi, Kathmandu, OOPS! is a one-stop destination for adventure, entertainment, and recreation for all age groups.",
        "The facility features a diverse range of thrilling attractions, including trampoline, zipline, soft play area, wall climbing, bowling alley, arcade and redemption games, virtual reality (VR) experiences, bumper cars, indoor games, vending machines, and much more.",
        "Beyond entertainment, OOPS! offers a range of complementary facilities, including ample parking, a vibrant food court, banquet facilities, a café, food and beverage stalls, and EV charging stations. With its exciting attractions and modern amenities, OOPS! caters to families, schools, young people, corporate groups, and embassies, providing an engaging environment for leisure, celebrations, team-building, and social gatherings.",
      ],
    },
    vision: {
      title: "Vision",
      body: "To introduce diverse and innovative entertainment concepts across Nepal, creating memorable recreational experiences for people of all ages.",
    },
    mission: {
      title: "Mission",
      body: "To successfully develop and operate world-class entertainment concepts like OOPS!, delivering exceptional experiences through innovation, quality, safety, and customer satisfaction.",
    },
    audiences: {
      eyebrow: "Made for everyone",
      title: "Who comes to OOPS!",
      items: ["Families", "Schools", "Young people", "Corporate groups", "Embassies"],
    },
    facilities: {
      eyebrow: "Beyond the games",
      title: "Facilities",
      subtitle: "Ample parking, a vibrant food court, banquet facilities, a café, food & beverage stalls and EV charging stations.",
    },
    gallery: {
      images: ["home/photos/12-oops-nepal", "home/photos/dsc07138", "attractions/wall-climbing/dsc-8022", "attractions/trampoline/trampoline"],
    },
  },
  attractions: {
    hero: {
      eyebrow: "100+ games & activities",
      title: "Attractions",
      subtitle: "Adventure, arcade, VR, bowling and more — explore everything waiting for you at OOPS! Nepal.",
    },
    safety: {
      eyebrow: "Play safe",
      title: "Good to know",
      items: [
        "Some activities have age, height, weight or safety requirements. Please check with our team before participating.",
        "Grip socks are compulsory for trampoline, soft play, rope course, wall climbing and bowling.",
        "Always follow the safety instructions given by OOPS! staff and wear the required safety equipment.",
        "Parents and guardians are responsible for supervising children where required.",
      ],
    },
  },
  "prices-offers": {
    hero: {
      eyebrow: "Prices & offers",
      title: "Load. Tap. *Play.*",
      subtitle:
        "There is no separate entry fee at OOPS! — load your game card with a Powerplay recharge and tap to play. Game prices range from Rs. 169 to Rs. 769.",
    },
    powerplay: {
      eyebrow: "Powerplay recharges",
      title: "Load for Powerplay",
      subtitle: "The more you load, the bigger the bonus.",
      poster: "offers/powerplay/powerplay-2026",
      columns: { pay: "You pay", credits: "Credits", bonus: "Bonus", total: "You get" },
      terms: [
        "All listed prices are in Nepalese Rupees (NPR) & inclusive of VAT.",
        "Recharged amounts cannot be transferred or refunded.",
        "Grip socks must be purchased for the trampoline, soft play, rope course, wall climbing & bowling.",
        "Outside food or drinks are not allowed in the facility.",
        "Management is not liable for lost/damaged cards; a new card costs Rs. 100.",
        "Bonus balances are valid only for designated bonus games & activities in the menu card.",
        "Photos and videos taken on-site belong to the venue and may be used.",
        "Management’s decisions on any disputes are final.",
        "Terms are subject to change without prior notice.",
      ],
    },
    facts: [
      { label: "Entry fee", value: "None — pay per game" },
      { label: "First recharge", value: "Min. Rs. 1,000" },
      { label: "Game prices", value: "Rs. 169 – 769" },
      { label: "New card", value: "Rs. 100" },
    ],
    regular: {
      eyebrow: "Every week",
      title: "All-day deals",
      subtitle: "Unlimited play and tap bundles on selected days.",
    },
    special: {
      eyebrow: "Limited time",
      title: "Other offers",
      subtitle: "Seasonal promotions, festival deals and partner campaigns.",
      emptyText: "New offers are on the way — follow @oopsinnepal for the latest deals.",
    },
    khalti: { enabled: true, text: "Also available on the Khalti app" },
  },
  events: {
    hero: {
      eyebrow: "Parties & events",
      title: "Events at OOPS!",
      subtitle:
        "Birthdays, school outings, corporate tournaments and brand activations — with customised packages and a professional team to run it all.",
      image: "events/social/24d9ba33-1cf5-40dc-af00-63f95b98df29",
    },
    upcoming: {
      eyebrow: "Coming up",
      title: "Upcoming events",
      subtitle: "Mark your calendar for what’s next at OOPS!",
      emptyText: "New events will be announced soon. Follow @oopsinnepal on Instagram for updates.",
    },
    banquet: {
      eyebrow: "Venue",
      title: "Banquet hall",
      subtitle:
        "OOPS! features a spacious, fully air-conditioned banquet hall with a capacity of 40–50 guests, making it an ideal venue for intimate gatherings and small to mid-sized events. The banquet hall is perfect for hosting both social and corporate functions, including birthday celebrations, family gatherings, private parties, meetings, workshops, seminars, team-building sessions, and corporate events.",
      image: "attractions/banquet-hall/img-0410",
      points: ["Fully air-conditioned", "40–50 guests", "Social & corporate functions"],
    },
    booking: {
      eyebrow: "Book now",
      title: "Plan your event with us",
      subtitle: "Tell us what you’re celebrating and our events team will get back to you with a customised package.",
      phone: "+977 9767356014",
      email: "marketing.oops.np@gmail.com",
      successMessage: "Thank you! Our events team will contact you shortly.",
    },
  },
  gallery: {
    hero: {
      eyebrow: "Gallery",
      title: "Moments at OOPS!",
      subtitle: "Birthdays, tournaments, celebrity visits and everyday fun.",
    },
  },
  contact: {
    hero: {
      eyebrow: "Contact",
      title: "Get in touch",
      subtitle: "Questions, bookings or partnerships — we’d love to hear from you.",
    },
    form: {
      eyebrow: "Send a message",
      title: "Book now",
      subtitle: "Share your name, number and a short message — we’ll call you back.",
      successMessage: "Thank you! We’ll get back to you shortly.",
    },
  },
  faq: {
    hero: {
      eyebrow: "Help",
      title: "Frequently asked questions",
      subtitle: "Everything you need to know before your visit.",
    },
    cta: { title: "Still have questions?", subtitle: "Call our reception or send us a message — we’re happy to help." },
  },
  terms: {
    hero: { eyebrow: "Policies", title: "Rules & terms", subtitle: "Please read these before you play." },
    intro:
      "By purchasing a game card or package and participating in activities at OOPS! Nepal, you agree to the following rules and regulations, refund policy and waiver.",
    groups: [
      { key: "rules", title: "Rules & regulations" },
      { key: "refund", title: "Refund policy" },
      { key: "waiver", title: "Waiver" },
    ],
  },
};

const PAGE_TITLES: Record<PageSlug, { title: string; seo_title: string; seo_description: string }> = {
  home: {
    title: "Home",
    seo_title: "OOPS! Nepal — Nepal’s First Family Entertainment Centre",
    seo_description: settings.seo.description,
  },
  about: {
    title: "About",
    seo_title: "About OOPS! Nepal",
    seo_description: "OOPS! is one of Nepal’s first Family Entertainment Centers, offering 100+ games and activities under one roof in Dhumbarahi, Kathmandu.",
  },
  attractions: {
    title: "Attractions",
    seo_title: "Attractions — Trampoline, Zipline, Bowling, VR & Arcade",
    seo_description: "Trampoline, zipline, rope course, wall climbing, bowling, VR, arcade, bumper cars, soft play and more at OOPS! Nepal in Kathmandu.",
  },
  "prices-offers": {
    title: "Prices & Offers",
    seo_title: "Prices & Offers — Powerplay Recharges & Deals",
    seo_description: "Powerplay recharge bonuses, Adventure Marathon, 30 Taps Thrill, Unlimited Friday and seasonal offers at OOPS! Nepal.",
  },
  events: {
    title: "Events",
    seo_title: "Birthday Parties & Corporate Events in Kathmandu",
    seo_description: "Host birthday parties, school outings, corporate events, bowling tournaments and brand activations at OOPS! Nepal.",
  },
  gallery: {
    title: "Gallery",
    seo_title: "Gallery",
    seo_description: "Photos from OOPS! Nepal — birthdays, tournaments, celebrity visits and partner brands.",
  },
  contact: {
    title: "Contact",
    seo_title: "Contact OOPS! Nepal",
    seo_description: "Call +977 9851340905, email info.oopsnepal@gmail.com or visit us at Dhumbarahi Pipalbot, Kathmandu. Open daily 11 AM – 8 PM.",
  },
  faq: {
    title: "FAQ",
    seo_title: "Frequently Asked Questions",
    seo_description: "Location, entry fee, game prices, age requirements, bookings and opening hours at OOPS! Nepal.",
  },
  terms: {
    title: "Rules & Terms",
    seo_title: "Rules, Refund Policy & Waiver",
    seo_description: "Rules and regulations, refund policy and waiver for visitors of OOPS! Nepal.",
  },
};

export const pages: Page[] = (Object.keys(content) as PageSlug[]).map((slug) => ({
  slug,
  ...PAGE_TITLES[slug],
  og_image: null,
  content: content[slug],
})) as Page[];

// ---------------------------------------------------------------------------
// Attractions
// ---------------------------------------------------------------------------
export const categories: Category[] = [
  { ...row("cat-adventure", 1), slug: "adventure-play", name: "Adventure & Play", description: "Bounce, climb and balance your way through our active play zones.", accent: "green" },
  { ...row("cat-recreational", 2), slug: "recreational-amusement", name: "Recreational & Amusement", description: "Bowling, bumper cars, cricket and zipline thrills.", accent: "orange" },
  { ...row("cat-arcade", 3), slug: "arcade-games", name: "Arcade & Games", description: "Arcade, redemption, carnival, VR and prize machines.", accent: "purple" },
  { ...row("cat-thrill", 4), slug: "thrill-rides", name: "Thrill Rides", description: "Rides built for little adventurers.", accent: "pink" },
  { ...row("cat-indoor", 5), slug: "indoor-games", name: "Indoor Games", description: "Pool and relaxation between the action.", accent: "yellow" },
  { ...row("cat-facilities", 6), slug: "food-facilities", name: "Food & Facilities", description: "Food court, café, stalls, banquet hall and EV charging.", accent: "sea" },
];

const GRIP = "Grip socks are compulsory (available at the counter).";
const CHECK = "Age, height and weight requirements may apply — please check with our team.";

type AttractionSeed = Omit<Attraction, "id" | "sort" | "is_visible" | "images"> & { source: string };

const attractionSeeds: AttractionSeed[] = [
  {
    slug: "trampoline", name: "Trampoline", category_slug: "adventure-play", source: "Attractions/TRAMPOLINE",
    tagline: "Bounce higher than ever.",
    description: "Our trampoline park is where gravity takes a day off. Jump, flip and bounce across connected trampolines and foam pits built for kids, teens and grown-ups alike — with our team keeping an eye on every leap.",
    cover_image: "attractions/trampoline/trampoline", notes: [GRIP, CHECK], grip_socks: true, is_featured: true,
  },
  {
    slug: "zipline", name: "Zipline", category_slug: "recreational-amusement", source: "Attractions/RECREATIONAL & AMUSEMENT/ZIPLINE",
    tagline: "Fly across OOPS!",
    description: "Strap into a full safety harness and soar across the arena on our indoor zipline — a rush you will want to repeat.",
    cover_image: "attractions/zipline/dsc07455", notes: [CHECK], grip_socks: false, is_featured: true,
  },
  {
    slug: "rope-course", name: "Rope Course", category_slug: "adventure-play", source: "Attractions/ROPECOURSE",
    tagline: "Balance. Climb. Conquer.",
    description: "Test your balance and nerve on our multi-level rope course — rope bridges, wobbly beams and high-wire challenges, all on a secure harness.",
    cover_image: "attractions/rope-course/dsc09344", notes: [GRIP, CHECK], grip_socks: true, is_featured: false,
  },
  {
    slug: "wall-climbing", name: "Wall Climbing", category_slug: "adventure-play", source: "Attractions/WALL CLIMBING",
    tagline: "Seven walls. One summit.",
    description: "Seven colourful climbing walls with routes for first-timers and fearless climbers. Clip in, climb up and race your friends to the top.",
    cover_image: "attractions/wall-climbing/dsc-8022", notes: [GRIP, CHECK], grip_socks: true, is_featured: true,
  },
  {
    slug: "soft-play", name: "Soft Play", category_slug: "adventure-play", source: "Attractions/SOFTPLAY",
    tagline: "Made for little explorers.",
    description: "A colourful, padded play zone with slides, ball pits and climbing structures where little ones can play safely while parents relax nearby.",
    cover_image: "attractions/soft-play/softplay-area", notes: [GRIP, "Parents/guardians are responsible for supervising children."], grip_socks: true, is_featured: true,
  },
  {
    slug: "bowling", name: "Bowling", category_slug: "recreational-amusement", source: "Attractions/RECREATIONAL & AMUSEMENT/BOWLING",
    tagline: "Strike it big.",
    description: "Glow-lit bowling lanes for families, friendly rivalries, birthday parties and corporate tournaments. Grab your crew and go for the strike.",
    cover_image: "attractions/bowling/dsc-7921", notes: [GRIP], grip_socks: true, is_featured: true,
  },
  {
    slug: "bumper-car", name: "Bumper Car", category_slug: "recreational-amusement", source: "Attractions/RECREATIONAL & AMUSEMENT/BUMPER CAR",
    tagline: "Spin, dodge and bump.",
    description: "Buckle up for classic bumper-car chaos — spin, dodge and bump your friends around the neon arena.",
    cover_image: "attractions/bumper-car/screenshot-2026-10-12-at-7-10-54-pm", notes: [CHECK], grip_socks: false, is_featured: true,
  },
  {
    slug: "cricket-simulator", name: "Cricket Simulator", category_slug: "recreational-amusement", source: "Attractions/RECREATIONAL & AMUSEMENT/CRICKET SIMULATOR",
    tagline: "Face the fast bowlers.",
    description: "Take your stance, face the deliveries and see how many runs you can score on our cricket simulator.",
    cover_image: "attractions/cricket-simulator/dsc09410", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "arcade", name: "Arcade Games", category_slug: "arcade-games", source: "Attractions/ARCADE",
    tagline: "Press start.",
    description: "Racing seats, shooting games, air hockey and more — our arcade is packed with modern machines for every age and every skill level.",
    cover_image: "attractions/arcade/10-oops-nepal", notes: [], grip_socks: false, is_featured: true,
  },
  {
    slug: "redemption-games", name: "Redemption Games", category_slug: "arcade-games", source: "Attractions/REDEMPTION",
    tagline: "Win tickets. Claim prizes.",
    description: "Play, win tickets and trade them for prizes at the redemption counter. Every high score turns into something you can take home.",
    cover_image: "attractions/redemption-games/dsc-7853", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "carnival-games", name: "Carnival Games", category_slug: "arcade-games", source: "Attractions/CARNIVAL GAMES",
    tagline: "Step right up!",
    description: "Classic fairground fun — test your aim and your luck at our carnival game stalls and win prizes on the spot.",
    cover_image: "attractions/carnival-games/88ac2cca-6676-48d9-977a-7db514dc7b56", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "virtual-reality", name: "Virtual Reality", category_slug: "arcade-games", source: "Attractions/VIRTUAL REALITY",
    tagline: "Step into other worlds.",
    description: "Immersive VR experiences — from multi-screen racing simulators to motion rides and shooters that put you right in the action.",
    cover_image: "attractions/virtual-reality/dsc07469", notes: [CHECK], grip_socks: false, is_featured: true,
  },
  {
    slug: "vending-machines", name: "Vending Machines", category_slug: "arcade-games", source: "Attractions/VENDING MACHINE",
    tagline: "One more try?",
    description: "Claw machines and prize vending machines stocked with toys, plushies and surprises.",
    cover_image: "attractions/vending-machines/2e26f3c5451b3477ddef9f2289e209e8", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "kids-excavator", name: "Kids Excavator", category_slug: "thrill-rides", source: "Attractions/THRILL RIDES/KIDS EXCAVATOR",
    tagline: "Little hands, big machines.",
    description: "Young builders take the controls of a ride-on excavator and scoop up some serious fun.",
    cover_image: "attractions/kids-excavator/img-3854", notes: [CHECK], grip_socks: false, is_featured: false,
  },
  {
    slug: "massage-chairs", name: "Massage Chairs", category_slug: "indoor-games", source: "Attractions/INDOOR GAMES/MASSAGE CHAIRS",
    tagline: "Recharge between games.",
    description: "Take a break between games in our massage chairs — the perfect recharge for parents and players alike.",
    cover_image: "attractions/massage-chairs/img-7229", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "pool-table", name: "Pool Table", category_slug: "indoor-games", source: "Attractions/INDOOR GAMES/POOL TABLE",
    tagline: "Rack ’em up.",
    description: "Rack up a game of pool with friends and family in our indoor games area.",
    cover_image: "attractions/pool-table/dsc07753", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "food-court", name: "Food Court", category_slug: "food-facilities", source: "Attractions/FOOD COURT",
    tagline: "Relax, refresh, recharge.",
    description: "The OOPS! Nepal Food Court offers a delightful dining experience for visitors of all ages, with a variety of food and beverage options to satisfy every craving. Whether you're taking a break between games, enjoying a family outing, or celebrating a special occasion, our food court is the perfect place to relax, refresh, and recharge.",
    cover_image: "attractions/food-court/whatsapp-image-2026-10-12-at-6-01-25-pm-1", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "cafe", name: "Café", category_slug: "food-facilities", source: "Attractions/CAFE",
    tagline: "Coffee break, OOPS! style.",
    description: "Grab a coffee, a shake or a quick bite at the OOPS! café — a cosy spot to sit back while the kids keep playing.",
    cover_image: "attractions/cafe/whatsapp-image-2026-10-12-at-6-01-23-pm-1", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "food-stalls", name: "Food Stalls", category_slug: "food-facilities", source: "Attractions/FOOD STALLS",
    tagline: "Snacks on the go.",
    description: "Food and beverage stalls serve quick bites and drinks so the fun never has to stop for long.",
    cover_image: "attractions/food-stalls/whatsapp-image-2026-10-12-at-6-01-23-pm", notes: [], grip_socks: false, is_featured: false,
  },
  {
    slug: "banquet-hall", name: "Banquet Hall", category_slug: "food-facilities", source: "Attractions/BANQUET HALL",
    tagline: "Celebrate in style.",
    description: "OOPS! features a spacious, fully air-conditioned banquet hall with a capacity of 40–50 guests, making it an ideal venue for intimate gatherings and small to mid-sized events. The banquet hall is perfect for hosting both social and corporate functions, including birthday celebrations, family gatherings, private parties, meetings, workshops, seminars, team-building sessions, and corporate events.",
    cover_image: "attractions/banquet-hall/img-0410", notes: ["Capacity: 40–50 guests", "Fully air-conditioned"], grip_socks: false, is_featured: false,
  },
  {
    slug: "ev-charging-station", name: "EV Charging Station", category_slug: "food-facilities", source: "Attractions/CHARGING STATION",
    tagline: "Charge while you play.",
    description: "Charge your electric vehicle while you play — OOPS! offers an on-site EV charging station alongside ample parking.",
    cover_image: "attractions/ev-charging-station/whatsapp-image-2026-10-12-at-6-01-26-pm", notes: [], grip_socks: false, is_featured: false,
  },
];

export const attractions: Attraction[] = attractionSeeds.map(({ source, ...a }, i) => {
  const images = fromSource(source);
  const cover = a.cover_image && images.includes(a.cover_image) ? a.cover_image : images[0] ?? null;
  return { ...row(`attraction-${a.slug}`, i + 1), ...a, cover_image: cover, images };
});

// ---------------------------------------------------------------------------
// Prices & offers
// ---------------------------------------------------------------------------
export const powerplayTiers: PowerplayTier[] = [
  [1000, 1000, 0, 1000],
  [2500, 3000, 500, 3500],
  [5000, 6500, 1500, 8000],
  [10000, 15000, 5000, 20000],
  [20000, 35000, 10000, 45000],
  [50000, 90000, 30000, 120000],
].map(([pay, credits, bonus, total], i) => ({
  ...row(`powerplay-${pay}`, i + 1),
  pay,
  credits,
  bonus,
  total,
  is_highlight: pay === 50000,
}));

const offerBase = {
  options: [],
  inclusions: [],
  notes: null,
  wide_image: null,
  starts_on: null,
  ends_on: null,
  khalti: false,
  cta_label: null,
  cta_url: null,
  price_label: null,
  price_note: null,
  tagline: null,
  schedule: null,
  poster_image: null,
} satisfies Partial<Offer>;

export const offers: Offer[] = [
  {
    ...row("offer-adventure-marathon", 1), ...offerBase,
    slug: "adventure-marathon", kind: "regular", title: "Adventure Marathon",
    tagline: "Jump, climb, conquer, repeat!",
    schedule: "Everyday · 11 AM – 8 PM",
    price_label: "Rs. 999", price_note: "per person",
    options: [
      { title: "Adventure", price: "Rs. 999", description: "Unlimited trampoline, rope course & 7 walls climbing all day long." },
      { title: "Adventure + Arcade", price: "Rs. 1,499", description: "Unlimited trampoline, rope course & 7 walls climbing + all arcade games (1 time), all day long." },
    ],
    inclusions: ["Trampoline", "Rope course", "7 walls climbing", "All arcade games / 1 time (Rs. 1,499 pass)"],
    notes: "One-time entry per activity | Unlimited play inside | No re-entry | Valid for a day | Grip socks compulsory (extra) | No refund | No clubbing with other offers. T&C apply.",
    poster_image: "offers/adventure-marathon/adv-marathon-post",
    wide_image: "offers/adventure-marathon/adv-marathon-landscape",
    khalti: true,
  },
  {
    ...row("offer-30-taps-thrill", 2), ...offerBase,
    slug: "30-taps-thrill", kind: "regular", title: "30 Taps Thrill",
    tagline: "Pick your 30. Play your way.",
    schedule: "Every Tuesday & Thursday · 11 AM – 8 PM",
    price_label: "NPR 3,999", price_note: "per person",
    inclusions: [
      "Trampoline", "Softplay", "7 walls climbing", "Rope course", "Bumper car", "Cricket simulator", "All VR games",
      "Bowling", "All arcade games", "All redemption games", "Zipline", "Pool", "Massage chairs", "Kids excavator & more",
    ],
    notes: "Enjoy any 30 taps of games & activities. The offer is valid for a day only & exclusive of tickets, vending & claw machines, carnival games & other sales items. Grip socks compulsory (extra) | No refund | Bands/cards once lost or damaged will not be reissued again. T&C apply.",
    poster_image: "offers/30-taps-thrill/30-taps-thrill",
    wide_image: "offers/30-taps-thrill/30-taps-thrill-landscape",
    khalti: true,
  },
  {
    ...row("offer-unlimited-friday", 3), ...offerBase,
    slug: "unlimited-friday", kind: "regular", title: "Unlimited Friday",
    tagline: "Your Good Friday just got better.",
    schedule: "Every Friday · 11 AM – 8 PM",
    price_label: "Rs. 1,999", price_note: "per person",
    inclusions: [
      "Trampoline", "Softplay", "7 walls climbing", "Rope course", "Cricket simulator", "All VR games", "All arcade games",
      "All redemption games", "Zipline", "Pool", "Massage chairs", "Kids excavator & more",
    ],
    notes: "Enjoy games & activities unlimited all day long. The offer is valid for a day only & exclusive of bowling, bumper car, tickets, vending & claw machines, carnival games & other sales items. Grip socks compulsory (extra) | No refund. Bands/cards once lost or damaged will not be reissued again. T&C apply.",
    poster_image: "offers/unlimited-friday/unlimited-friday",
    wide_image: "offers/unlimited-friday/unlimited-friday-landscape",
    khalti: true,
  },
  {
    ...row("offer-dashain-20-taps", 4), ...offerBase,
    slug: "dashain-ko-20-taps-dhamaka", kind: "special", title: "Dashain ko 20 Taps Dhamaka",
    tagline: "Play more. Celebrate more!",
    schedule: "October 18 (Sunday) – October 23 (Friday) · 11 AM – 8 PM",
    price_label: "NPR 1,299", price_note: "per person",
    inclusions: [
      "Trampoline", "Softplay", "7 walls climbing", "Rope course", "Bumper car", "VR games", "Bowling", "Arcade games",
      "Cricket simulator", "Redemption games", "Kids excavator", "Massage chairs", "Zipline", "Pool & more",
    ],
    notes: "Enjoy any 20 taps across 100+ games & activities. Valid for one day only. Excludes tickets, vending machines, claw machines, carnival games & sales items. Socks not included (extra). No refunds, cash exchange or clubbing with other offers. Lost/damaged cards will not be reissued or refunded. Games subject to availability. T&C apply.",
    poster_image: "offers/special/8572bda1-c79a-43c2-a6af-72bd1e3ef49a",
    starts_on: "2026-10-18", ends_on: "2026-10-23",
  },
  {
    ...row("offer-bumper-prize", 5), ...offerBase,
    slug: "dashain-tihar-bumper-prize", kind: "special", title: "Dashain Tihar Bumper Prize",
    tagline: "Celebrate Dashain & Tihar at OOPS! to win exciting prizes.",
    schedule: "Dashain & Tihar · 11 AM – 8 PM",
    price_label: "Rs. 500", price_note: "bumper prize ticket",
    options: [
      { title: "1st prize", price: "Worth Rs. 3,38,000", description: "" },
      { title: "2nd prize", price: "Worth Rs. 65,000", description: "" },
      { title: "3rd prize", price: "Worth Rs. 37,000", description: "" },
    ],
    notes: "Buy the bumper prize ticket for just Rs. 500 & get an OOPS! card worth Rs. 500, with 100+ games & activities to choose from!",
    poster_image: "offers/special/65a22817-2614-4e21-84dd-a511b5305c0c",
  },
  {
    ...row("offer-ultima-jackpot", 6), ...offerBase,
    slug: "the-ultima-jackpot", kind: "special", title: "The Ultima Jackpot",
    tagline: "Play more. Win more. Redeem more.",
    schedule: "11 AM – 8 PM",
    price_label: "From 3,000 tickets", price_note: "redeem Ultima products",
    options: [
      { title: "Ultima Boombox 130 Karaoke Speaker", price: "35,000 tickets", description: "" },
      { title: "Ultima Watch Magnum E400", price: "4,600 tickets", description: "" },
      { title: "Ultima Boost 10K Mini Powerbank", price: "4,000 tickets", description: "" },
      { title: "Ultima Rapid 45W Dual Port GaN Charging Adapter", price: "3,600 tickets", description: "" },
      { title: "Ultima Bass 430 Headphone", price: "3,000 tickets", description: "" },
      { title: "Ultima Boom Sleek Earbuds", price: "3,000 tickets", description: "" },
    ],
    notes: "Play arcade & redemption games at OOPS!, earn tickets & redeem exciting Ultima products across different ticket values. T&C apply.",
    poster_image: "offers/special/the-ultima-jackpot-post",
  },
];

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
const socialImages = fromSource("Events/Social and Private Events");
const corporateImages = fromSource("Events/Corporate Events");

export const eventTypes: EventType[] = [
  {
    ...row("event-social", 1),
    slug: "social-private",
    title: "Social & Private Events",
    description:
      "OOPS! Nepal hosts a wide range of social and private events, including birthday parties, anniversaries, workshops, summer camps, competitions, school outings, and NGO events. We offer customized packages tailored to each client’s needs and requirements. Our professional team ensures seamless event planning and execution, managing everything from décor and sound arrangements to coordination and on-site operations for a memorable experience.",
    highlights: ["Birthday parties", "Anniversaries", "Workshops", "Summer camps", "Competitions", "School outings", "NGO events"],
    cover_image: "events/social/24d9ba33-1cf5-40dc-af00-63f95b98df29",
    images: socialImages,
    videos: ["events/social/birthday-packages", "events/social/birthday-at-oops"],
  },
  {
    ...row("event-corporate", 2),
    slug: "corporate",
    title: "Corporate Events",
    description:
      "OOPS! Nepal offers a suitable venue for corporate events, including bowling tournaments, corporate outings, employee engagement activities, product promotions, and brand activations. Our professional team assists with event planning and coordination, with customized packages available to meet each organization's objectives and requirements.",
    highlights: ["Bowling tournaments", "Corporate outings", "Employee engagement", "Product promotions", "Brand activations"],
    cover_image: "events/corporate/1",
    images: corporateImages,
    videos: [],
  },
];

export const upcomingEvents: UpcomingEvent[] = [];

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const galleryAlbums: GalleryAlbum[] = [
  { ...row("album-general", 1), slug: "general", title: "General", description: "Everyday fun, birthdays and big moments.", layout: "photos" },
  { ...row("album-hall-of-fame", 2), slug: "hall-of-fame", title: "Hall of Fame", description: "Celebrities, artists and creators who played at OOPS!", layout: "people" },
  { ...row("album-partners", 3), slug: "partners", title: "Partner brands", description: "Brands, schools, colleges and embassies we have worked with.", layout: "logos" },
];

const mediaName = new Map(rawMedia.map((m) => [m.path, m.name]));

export const galleryItems: GalleryItem[] = [
  ...fromSource("Gallery/General", "Events/Gallery/General").map((image, i) => ({
    ...row(`gallery-general-${i}`, i + 1), album_slug: "general", image, caption: null,
  })),
  ...fromSource("Gallery/Hall of Fame", "Events/Gallery/Hall of Fame")
    .map((image) => ({ image, caption: personName(mediaName.get(image) ?? "") || null }))
    .sort((a, b) => Number(!a.caption) - Number(!b.caption))
    .map(({ image, caption }, i) => ({ ...row(`gallery-hof-${i}`, i + 1), album_slug: "hall-of-fame", image, caption })),
  ...fromSource("Gallery/Partner brands", "Events/Gallery/Partner brands").map((image, i) => ({
    ...row(`gallery-partner-${i}`, i + 1), album_slug: "partners", image, caption: brandName(mediaName.get(image) ?? "") || null,
  })),
];

// ---------------------------------------------------------------------------
// Reviews (transcribed from the Google review screenshots)
// ---------------------------------------------------------------------------
export const reviews: Review[] = [
  {
    author: "Neha Agrawal", rating: 5, date_label: "3 months ago", badge: null,
    body: "Excellent Experience! Had an amazing time at the amusement park! The rides were exciting, the place was clean and well-maintained, and the staff were friendly and helpful. There were plenty of activities for both kids and adults. A perfect destination for a fun-filled day with family and friends. Highly recommended!",
  },
  {
    author: "Priya Tamrakar", rating: 5, date_label: "2 months ago", badge: null,
    body: "A fantastic addition to Kathmandu's entertainment scene! Tons of indoor activities ranging from arcade games, wall climbing, and bowling to virtual reality zones. It can get a bit pricey depending on how many games you play, but the bonus packages they offer make it worth it. Great atmosphere, spacious parking, and friendly staff. Will definitely visit again!",
  },
  {
    author: "Sonu Chaurasiya", rating: 5, date_label: "3 months ago", badge: null,
    body: "Had a really fun experience at OOPS! Nepal. The place is well-maintained, clean, and offers a great variety of games and activities for both kids and adults. The staff were friendly and supportive throughout our visit. It’s a nice destination for spending quality time with friends and family. Looking forward to visiting again.",
  },
  {
    author: "Nischaya Dhami", rating: 4, date_label: "3 months ago", badge: null,
    body: "I recently visited OOPS! NEPAL - First FEC funpark in Nepal and had a wonderful experience. It is one of the best entertainment destinations in Kathmandu with exciting activities such as bowling, trampoline, arcade games, VR games, zipline, and many more. The environment is clean, safe, and family-friendly. The staff are helpful and the facilities are well maintained. Although some activities can be a bit expensive, the fun and enjoyment make it worth visiting. I would highly recommend OOPS! Nepal to students, friends, and families looking for a fun day out.",
  },
  {
    author: "Pramin Manandhar", rating: 5, date_label: "a year ago", badge: "Local Guide",
    body: "Fun place to play arcade games. We got a golden membership here as we visit often here. I really love the bowling lane here, better than that of Civil Mall Arcade. We normally play bowling here and jump :) Really enjoyed the atmosphere here and it’s really awesome if you have a large group there are lots of arcade games.",
  },
  {
    author: "Jenish", rating: 4, date_label: "2 months ago", badge: "Local Guide",
    body: "I had a good experience for the first time at Oops Nepal. The place has a very children friendly environment, the staffs were very helpful and the arcades games and machines as such were of top tier available in Nepal. There was not much of a crowd such that you have to wait in line (except bowling). I do recommend this place for the bowling experience.",
  },
  {
    author: "Utz Singh", rating: 4, date_label: "10 months ago", badge: "Local Guide",
    body: "Fantastic indoor games for you and your family member. This place is not so much big but you will enjoy for a day. There are many indoor games but the best one is Jump and bowling.",
  },
].map((r, i) => ({ ...row(`review-${i}`, i + 1), source: "Google", ...r }));

// ---------------------------------------------------------------------------
// FAQ, rules, refund policy & waiver (from "faq oops.docx")
// ---------------------------------------------------------------------------
export const faqs: Faq[] = [
  ["Where is OOPS! Nepal located?", "OOPS! Nepal is located in Dhumbarahi, Kathmandu, Nepal. We also provide parking facilities for our visitors."],
  ["Is there an entry fee at OOPS! Nepal?", "No, there is no separate entry fee at OOPS! Nepal. We use a game card system, and visitors can recharge their cards through our Powerplay packages. The minimum recharge amount is Rs. 1,000 for first-time customers."],
  ["What are the prices of the games?", "Game prices at OOPS! Nepal range from Rs. 169 to Rs. 769, depending on the game or activity."],
  ["What activities are available at OOPS! Nepal?", "We offer a variety of exciting activities, including arcade games, VR experiences, bowling, trampoline, wall climbing, bumper cars, soft play, rope courses, ziplining, vending machines, redemption games and much more."],
  ["Are there any age or height restrictions?", "Some activities have specific age, height, weight, or safety requirements. These vary depending on the attraction. Please check with our team for details before participating."],
  ["Do I need to book in advance?", "No advance booking is required for Powerplay packages. Advance booking is recommended for birthday parties, school visits, group outings, corporate events, and other special occasions. Individual visitors are welcome, although availability may vary depending on the activity and crowd levels."],
  ["Can I host events at OOPS! Nepal?", "Yes! OOPS! Nepal is a great venue for birthday celebrations, school outings, corporate events, social gatherings, competitions, and other special occasions. Contact our team to learn more about available packages and booking options."],
  ["What are OOPS! Nepal's opening hours?", "OOPS! Nepal is open daily from 11:00 AM to 8:00 PM, throughout the week, including public holidays."],
  ["What other facilities does OOPS! have?", "We have other facilities like parking, an EV charging station, a food court, a café, food stalls and more."],
  ["Do you offer special packages or promotions?", "Yes! We may offer seasonal promotions, special packages, and event-specific deals. Please contact our team or check our official channels for the latest offers."],
  ["Is OOPS! Nepal suitable for all age groups?", "Yes! OOPS! Nepal offers a variety of games and activities for children, teenagers, and adults, making it a great destination for families and friends."],
].map(([question, answer], i) => ({ ...row(`faq-${i}`, i + 1), question, answer }));

export const policySections: PolicySection[] = (
  [
    ["rules", "Entry", ["Entry on games is permitted only with a valid OOPS! card.", "Customers must follow the age, height, weight and other eligibility requirements of the activities."]],
    ["rules", "Safety", ["Customers must follow all safety instructions and directions given by OOPS! Nepal staff.", "Required safety equipment must be worn correctly at all times."]],
    ["rules", "Proper use of facilities", ["All the games, rides and equipment must be used only for their intended purpose.", "Damaging, misusing or tampering with equipment is strictly prohibited.", "Customers may be charged for intentional damage to OOPS! Nepal property."]],
    ["rules", "Prohibited items", ["Sharp objects, dangerous items and prohibited substances are not allowed.", "Outside food and beverages are not permitted in OOPS! Nepal.", "Pets are not allowed at OOPS! Nepal."]],
    ["rules", "Children and guardians", ["Children must follow the age requirements of the activities.", "Parents/guardians are responsible for supervising children where required.", "Guardians must ensure that children follow all safety instructions."]],
    ["rules", "OOPS! card", ["Customers must use their own card for activities.", "Cards must not be shared or transferred to another customer.", "Lost cards must be reported and can be replaced with proper customer identification and the required charges."]],
    ["rules", "Personal belongings", ["Customers are responsible for their personal belongings.", "OOPS! Nepal is not responsible for unattended or lost personal belongings, subject to applicable law."]],
    ["rules", "Complaints and assistance", ["Customers may approach OOPS! Nepal staff or management for assistance, complaints or clarification of rules."]],
    ["refund", "No refund after purchase", ["Once a card is issued or a package has been purchased, it is generally non-refundable."]],
    ["refund", "Unused balance", ["Unused credits or balance are not refundable; customers can use the balance the next time they visit OOPS! Nepal."]],
    ["refund", "Wrong purchase", ["Customers are requested to check the activity, package and amount before making payment. Refunds due to an incorrect selection may not be provided."]],
    ["refund", "Customer cancellation", ["If a customer chooses not to participate after purchasing an activity, the amount will generally not be refunded."]],
    ["refund", "Technical problems", ["If an activity cannot be provided due to equipment failure or a technical problem caused by OOPS! Nepal, management may provide a replacement activity, rescheduling, or a refund, depending on the circumstance."]],
    ["waiver", "Participant waiver", [
      "Participation in all activities is voluntary and at the participant’s own risk.",
      "Participants must follow all safety rules, instructions, and staff guidelines.",
      "Required safety equipment and socks must be worn for designated activities.",
      "OOPS! Nepal is not responsible for injuries caused by negligence, misuse, or failure to follow instructions.",
      "Participants must inform staff of any relevant health or medical conditions before participating.",
      "Game cards and purchased items are subject to OOPS! Nepal’s terms and conditions.",
      "Management reserves the right to refuse participation or take necessary action for safety or rule violations.",
      "Parents or legal guardians must provide consent for minors participating in activities.",
      "Participants understand that accidents may occur even when proper safety measures are followed.",
      "By signing the waiver, participants confirm that they have read, understood, and agreed to all terms and conditions.",
    ]],
  ] as const
).map(([group_key, title, items], i) => ({ ...row(`policy-${i}`, i + 1), group_key, title, items: [...items] }));

export const media = seedMedia;

import type { PageSlug } from "@/lib/types";
import { boolean, copy, date, group, image, images, link, list, number, repeater, select, text, textarea, url, video, type Field } from "./fields";

export const SETTINGS_FIELDS: Field[] = [
  group("brand", "Brand", [
    text("name", "Business name", { required: true, half: true }),
    text("shortName", "Short name", { half: true }),
    text("tagline", "Tagline", { half: true }),
    image("logo", "Logo (for dark backgrounds)", { required: true }),
    image("logoDark", "Logo (for light backgrounds)"),
  ]),
  group("announcement", "Announcement bar", [
    boolean("enabled", "Show the announcement bar", { half: true }),
    date("until", "Hide automatically after", { half: true }),
    text("text", "Text"),
    text("href", "Link", { placeholder: "/prices-offers#other-offers" }),
  ]),
  group("contact", "Contact", [
    text("receptionPhone", "Reception phone", { half: true }),
    text("managementPhone", "Management phone", { half: true }),
    text("generalEmail", "Email (general)", { half: true }),
    text("managementEmail", "Email (management) — receives Book Now enquiries", { half: true }),
    text("whatsapp", "WhatsApp number (optional)", { half: true }),
  ]),
  group("hours", "Opening hours", [
    text("label", "Hours", { half: true, placeholder: "11 AM – 8 PM" }),
    text("note", "Note", { half: true, placeholder: "Open daily, including public holidays" }),
    text("opens", "Opens (24h, for Google)", { half: true, placeholder: "11:00" }),
    text("closes", "Closes (24h, for Google)", { half: true, placeholder: "20:00" }),
  ]),
  group("address", "Address & map", [
    text("street", "Street", { half: true }),
    text("city", "City", { half: true }),
    text("region", "Province", { half: true }),
    text("postalCode", "Postal code", { half: true }),
    text("country", "Country", { half: true }),
    url("mapUrl", "Google Maps link"),
    url("mapEmbedUrl", "Google Maps embed URL", { help: "Google Maps → Share → Embed a map → copy the src link." }),
  ]),
  repeater(
    "socials",
    "Social media",
    [
      select(
        "platform",
        "Platform",
        [
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "tiktok", label: "TikTok" },
          { value: "youtube", label: "YouTube" },
          { value: "tripadvisor", label: "Tripadvisor" },
          { value: "x", label: "X (Twitter)" },
          { value: "whatsapp", label: "WhatsApp" },
        ],
        { half: true },
      ),
      text("handle", "Handle", { half: true }),
      url("url", "Link"),
    ],
    { itemLabel: "platform", addLabel: "Add social link" },
  ),
  repeater("stats", "Big numbers", [number("value", "Number", { half: true }), text("suffix", "After the number", { half: true, placeholder: "+" }), text("label", "Label")], {
    itemLabel: "label",
    addLabel: "Add number",
  }),
  repeater("nav", "Main menu", [text("label", "Label", { half: true }), text("href", "Link", { half: true })], { itemLabel: "label", addLabel: "Add menu item" }),
  group("cta", "Header button", [link("book", "Book button"), text("callLabel", "Call button label")]),
  group("footer", "Footer", [
    textarea("blurb", "Short description", { rows: 2 }),
    text("copyright", "Copyright line", { help: "{year} is replaced with the current year." }),
    repeater("links", "Footer links", [text("label", "Label", { half: true }), text("href", "Link", { half: true })], { itemLabel: "label" }),
  ]),
  group("seo", "Search engines (SEO)", [
    url("siteUrl", "Website address", { placeholder: "https://www.oopsnp.com" }),
    text("title", "Default page title"),
    text("titleTemplate", "Title template", { help: "%s is replaced with the page title." }),
    textarea("description", "Default description", { rows: 3 }),
    image("ogImage", "Share image (Facebook, WhatsApp…)"),
    list("keywords", "Keywords"),
  ]),
];

export const PAGE_SEO_FIELDS: Field[] = [
  text("title", "Page name (admin only)", { half: true }),
  text("seo_title", "Browser tab / Google title", { half: true }),
  textarea("seo_description", "Google description", { rows: 2 }),
  image("og_image", "Share image (optional)"),
];

export const PAGE_FIELDS: Record<PageSlug, Field[]> = {
  home: [
    copy("hero", "Hero", [
      link("primaryCta", "Main button"),
      link("secondaryCta", "Second button"),
      video("video", "Background video"),
      image("poster", "Video poster image"),
      list("chips", "Small badges"),
    ]),
    copy("stats", "Numbers section", [], false),
    copy("attractions", "Attractions section", [link("cta", "Button")]),
    copy("offers", "Offers section", [link("cta", "Button")]),
    copy("movie", "Video section", [video("video", "Video"), image("poster", "Poster image"), url("youtubeUrl", "YouTube link (optional — used instead of the video)")]),
    copy("events", "Events section", [link("cta", "Button"), image("image", "Photo"), list("points", "Points")]),
    copy("photos", "Photo marquee", [images("images", "Photos")], false),
    copy("reviews", "Reviews section", [text("rating", "Google rating (optional, e.g. 4.6)", { half: true }), url("googleUrl", "Google reviews link", { half: true })]),
    copy("hallOfFame", "Hall of Fame section", [link("cta", "Button")]),
    copy("partners", "Partner brands section"),
    copy("visit", "Visit us section"),
  ],
  about: [
    copy("hero", "Hero", [image("image", "Background photo")]),
    group("story", "About us", [text("title", "Title"), list("paragraphs", "Paragraphs")]),
    group("vision", "Vision", [text("title", "Title"), textarea("body", "Text", { rows: 3 })]),
    group("mission", "Mission", [text("title", "Title"), textarea("body", "Text", { rows: 3 })]),
    copy("audiences", "Who we serve", [list("items", "Groups")], false),
    copy("facilities", "Facilities section", [], true),
    group("gallery", "Photo collage", [images("images", "Photos (4)")]),
  ],
  attractions: [copy("hero", "Hero"), copy("safety", "Good to know", [list("items", "Points")], false)],
  "prices-offers": [
    copy("hero", "Hero"),
    copy("powerplay", "Powerplay section", [
      image("poster", "Powerplay poster"),
      group("columns", "Table headings", [
        text("pay", "Column 1", { half: true }),
        text("credits", "Column 2", { half: true }),
        text("bonus", "Column 3", { half: true }),
        text("total", "Column 4", { half: true }),
      ]),
      list("terms", "Terms & conditions"),
    ]),
    repeater("facts", "Quick facts", [text("label", "Label", { half: true }), text("value", "Value", { half: true })], { itemLabel: "label" }),
    copy("regular", "All-day deals section"),
    copy("special", "Other offers section", [textarea("emptyText", "Text when there are no offers", { rows: 2 })]),
    group("khalti", "Khalti badge", [boolean("enabled", "Show on offers marked “Khalti”", { half: true }), text("text", "Text", { half: true })]),
  ],
  events: [
    copy("hero", "Hero", [image("image", "Background photo")]),
    copy("upcoming", "Upcoming events section", [textarea("emptyText", "Text when there are no events", { rows: 2 })]),
    copy("banquet", "Banquet hall", [image("image", "Photo"), list("points", "Points")]),
    copy("booking", "Book now", [text("phone", "Phone", { half: true }), text("email", "Email", { half: true }), textarea("successMessage", "Thank-you message", { rows: 2 })]),
  ],
  gallery: [copy("hero", "Hero")],
  contact: [copy("hero", "Hero"), copy("form", "Form", [textarea("successMessage", "Thank-you message", { rows: 2 })])],
  faq: [copy("hero", "Hero"), group("cta", "Bottom box", [text("title", "Title"), textarea("subtitle", "Text", { rows: 2 })])],
  terms: [
    copy("hero", "Hero"),
    textarea("intro", "Introduction", { rows: 3 }),
    repeater("groups", "Sections", [text("key", "Key", { half: true, help: "rules, refund or waiver" }), text("title", "Title", { half: true })], { itemLabel: "title" }),
  ],
};

export const PAGE_LABELS: Record<PageSlug, string> = {
  home: "Homepage",
  about: "About",
  attractions: "Attractions",
  "prices-offers": "Prices & Offers",
  events: "Events",
  gallery: "Gallery",
  contact: "Contact",
  faq: "FAQ",
  terms: "Rules & Terms",
};

export const PAGE_PATHS: Record<PageSlug, string> = {
  home: "/",
  about: "/about",
  attractions: "/attractions",
  "prices-offers": "/prices-offers",
  events: "/events",
  gallery: "/gallery",
  contact: "/contact",
  faq: "/faq",
  terms: "/terms",
};

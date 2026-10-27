import {
  boolean,
  date,
  image,
  images,
  list,
  number,
  repeater,
  select,
  slug,
  text,
  textarea,
  url,
  videos,
  type Field,
} from "./fields";

export type CollectionKey =
  | "attractions"
  | "categories"
  | "offers"
  | "powerplay_tiers"
  | "event_types"
  | "events"
  | "gallery_albums"
  | "gallery_items"
  | "reviews"
  | "faqs"
  | "policy_sections";

export type Collection = {
  key: CollectionKey;
  label: string;
  singular: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  /** Group the list view by this field (e.g. gallery items by album). */
  groupBy?: string;
  /** Field holding a unique slug (generated from titleField when empty). */
  slugField?: string;
  fields: Field[];
  defaults?: Record<string, unknown>;
};

const visibility = [number("sort", "Order", { half: true, help: "Lower numbers appear first." }), boolean("is_visible", "Show on website", { half: true })];

const ACCENTS = [
  { value: "sea", label: "Sea blue" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
];

export const COLLECTIONS: Record<CollectionKey, Collection> = {
  attractions: {
    key: "attractions",
    label: "Attractions",
    singular: "Attraction",
    description: "Games, rides and facilities. Each one gets its own page.",
    titleField: "name",
    subtitleField: "tagline",
    imageField: "cover_image",
    slugField: "slug",
    fields: [
      text("name", "Name", { required: true, half: true }),
      slug("slug", "Page address", "name"),
      select("category_slug", "Category", "categories", { half: true }),
      text("tagline", "Tagline", { half: true }),
      textarea("description", "Description", { rows: 5 }),
      image("cover_image", "Cover photo", { required: true }),
      images("images", "Photo gallery"),
      list("notes", "Good-to-know notes", { placeholder: "e.g. Grip socks are compulsory" }),
      boolean("grip_socks", "Grip socks required", { half: true }),
      boolean("is_featured", "Feature on the homepage", { half: true }),
      ...visibility,
    ],
    defaults: { is_visible: true, notes: [], images: [] },
  },
  categories: {
    key: "categories",
    label: "Categories",
    singular: "Category",
    description: "Groups used to filter attractions.",
    titleField: "name",
    subtitleField: "description",
    slugField: "slug",
    fields: [
      text("name", "Name", { required: true, half: true }),
      slug("slug", "Key", "name"),
      textarea("description", "Description", { rows: 2 }),
      select("accent", "Colour", ACCENTS, { half: true }),
      ...visibility,
    ],
    defaults: { accent: "sea", is_visible: true },
  },
  offers: {
    key: "offers",
    label: "Offers",
    singular: "Offer",
    description: "All-day deals and limited-time offers. Offers disappear automatically after their end date.",
    titleField: "title",
    subtitleField: "schedule",
    imageField: "poster_image",
    slugField: "slug",
    fields: [
      text("title", "Title", { required: true, half: true }),
      slug("slug", "Anchor", "title"),
      select(
        "kind",
        "Type",
        [
          { value: "regular", label: "All-day deal (every week)" },
          { value: "special", label: "Other offer (limited time)" },
        ],
        { half: true },
      ),
      text("tagline", "Tagline", { half: true }),
      text("schedule", "Schedule", { placeholder: "e.g. Every Friday · 11 AM – 8 PM" }),
      text("price_label", "Price", { half: true, placeholder: "e.g. Rs. 1,999" }),
      text("price_note", "Price note", { half: true, placeholder: "e.g. per person" }),
      repeater("options", "Price options / prizes", [text("title", "Name", { half: true }), text("price", "Price", { half: true }), textarea("description", "Description", { rows: 2 })], {
        itemLabel: "title",
        addLabel: "Add option",
        help: "Use when there is more than one price (e.g. Rs. 999 and Rs. 1,499 passes).",
      }),
      list("inclusions", "What's included"),
      textarea("notes", "Notes / fine print", { rows: 3 }),
      image("poster_image", "Poster (portrait)", { required: true }),
      image("wide_image", "Wide banner (landscape, optional)"),
      date("starts_on", "Starts on", { half: true }),
      date("ends_on", "Ends on (hidden after this date)", { half: true }),
      boolean("khalti", "Also available on Khalti", { half: true }),
      text("cta_label", "Button text (optional)", { half: true }),
      url("cta_url", "Button link (optional)", { half: true }),
      ...visibility,
    ],
    defaults: { kind: "special", is_visible: true, options: [], inclusions: [] },
  },
  powerplay_tiers: {
    key: "powerplay_tiers",
    label: "Powerplay table",
    singular: "Powerplay row",
    description: "Rows of the “Load for Powerplay” recharge table.",
    titleField: "pay",
    subtitleField: "total",
    fields: [
      number("pay", "You pay (Rs.)", { required: true, half: true, min: 0 }),
      number("credits", "Credits", { required: true, half: true, min: 0 }),
      number("bonus", "Bonus", { half: true, min: 0 }),
      number("total", "You get", { required: true, half: true, min: 0 }),
      boolean("is_highlight", "Highlight this row", { half: true }),
      ...visibility,
    ],
    defaults: { is_visible: true },
  },
  event_types: {
    key: "event_types",
    label: "Event types",
    singular: "Event type",
    description: "Social & private events, corporate events…",
    titleField: "title",
    imageField: "cover_image",
    slugField: "slug",
    fields: [
      text("title", "Title", { required: true, half: true }),
      slug("slug", "Anchor", "title"),
      textarea("description", "Description", { rows: 5 }),
      list("highlights", "Highlights"),
      image("cover_image", "Cover photo"),
      images("images", "Photos"),
      videos("videos", "Videos"),
      ...visibility,
    ],
    defaults: { is_visible: true, highlights: [], images: [], videos: [] },
  },
  events: {
    key: "events",
    label: "Upcoming events",
    singular: "Upcoming event",
    description: "Shown in “Upcoming events”. Past events hide automatically.",
    titleField: "title",
    subtitleField: "event_date",
    imageField: "poster_image",
    fields: [
      text("title", "Title", { required: true }),
      date("event_date", "Date", { half: true }),
      text("time_label", "Time", { half: true, placeholder: "e.g. 2 PM – 6 PM" }),
      textarea("description", "Description", { rows: 4 }),
      image("poster_image", "Poster"),
      text("cta_label", "Button text", { half: true }),
      url("cta_url", "Button link", { half: true }),
      ...visibility,
    ],
    defaults: { is_visible: true },
  },
  gallery_albums: {
    key: "gallery_albums",
    label: "Gallery albums",
    singular: "Album",
    description: "Tabs on the gallery page.",
    titleField: "title",
    subtitleField: "description",
    slugField: "slug",
    fields: [
      text("title", "Title", { required: true, half: true }),
      slug("slug", "Key", "title"),
      textarea("description", "Description", { rows: 2 }),
      select(
        "layout",
        "Layout",
        [
          { value: "photos", label: "Photos (masonry)" },
          { value: "people", label: "People (captioned portraits)" },
          { value: "logos", label: "Logos (white tiles)" },
        ],
        { half: true },
      ),
      ...visibility,
    ],
    defaults: { layout: "photos", is_visible: true },
  },
  gallery_items: {
    key: "gallery_items",
    label: "Gallery photos",
    singular: "Gallery photo",
    description: "Photos, Hall of Fame portraits and partner logos.",
    titleField: "caption",
    imageField: "image",
    groupBy: "album_slug",
    fields: [
      select("album_slug", "Album", "albums", { required: true, half: true }),
      text("caption", "Caption / name", { half: true }),
      image("image", "Image", { required: true }),
      ...visibility,
    ],
    defaults: { is_visible: true },
  },
  reviews: {
    key: "reviews",
    label: "Reviews",
    singular: "Review",
    description: "Google reviews shown on the homepage.",
    titleField: "author",
    subtitleField: "date_label",
    fields: [
      text("author", "Name", { required: true, half: true }),
      number("rating", "Stars (1–5)", { min: 1, max: 5, half: true }),
      textarea("body", "Review", { required: true, rows: 5 }),
      text("date_label", "When", { half: true, placeholder: "e.g. 3 months ago" }),
      text("source", "Source", { half: true }),
      text("badge", "Badge", { half: true, placeholder: "e.g. Local Guide" }),
      ...visibility,
    ],
    defaults: { rating: 5, source: "Google", is_visible: true },
  },
  faqs: {
    key: "faqs",
    label: "FAQ",
    singular: "Question",
    description: "Frequently asked questions.",
    titleField: "question",
    fields: [text("question", "Question", { required: true }), textarea("answer", "Answer", { required: true, rows: 4 }), ...visibility],
    defaults: { is_visible: true },
  },
  policy_sections: {
    key: "policy_sections",
    label: "Rules & policies",
    singular: "Policy section",
    description: "Rules & regulations, refund policy and waiver.",
    titleField: "title",
    subtitleField: "group_key",
    groupBy: "group_key",
    fields: [
      select(
        "group_key",
        "Group",
        [
          { value: "rules", label: "Rules & regulations" },
          { value: "refund", label: "Refund policy" },
          { value: "waiver", label: "Waiver" },
        ],
        { half: true, required: true },
      ),
      text("title", "Title", { required: true, half: true }),
      list("items", "Points"),
      ...visibility,
    ],
    defaults: { group_key: "rules", is_visible: true, items: [] },
  },
};

export const COLLECTION_ORDER: CollectionKey[] = [
  "attractions",
  "categories",
  "offers",
  "powerplay_tiers",
  "events",
  "event_types",
  "gallery_items",
  "gallery_albums",
  "reviews",
  "faqs",
  "policy_sections",
];

export function isCollection(key: string): key is CollectionKey {
  if (!Object.hasOwn(COLLECTIONS, key)) return false;
  return key in COLLECTIONS;
}

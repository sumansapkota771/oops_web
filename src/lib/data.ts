import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import * as seed from "@/content/seed";
import { isSupabaseConfigured } from "@/lib/env";
import { publicClient } from "@/lib/supabase/server";
import type {
  Attraction,
  Category,
  EventType,
  Faq,
  GalleryAlbum,
  GalleryItem,
  MediaRecord,
  Offer,
  Page,
  PageSlug,
  PolicySection,
  PowerplayTier,
  Review,
  SiteSettings,
  UpcomingEvent,
} from "@/lib/types";
import { todayInNepal, withDefaults } from "@/lib/utils";

/** Every public read is tagged with this; admin saves call updateTag(CONTENT_TAG). */
export const CONTENT_TAG = "content";

type Table =
  | "categories"
  | "attractions"
  | "offers"
  | "powerplay_tiers"
  | "event_types"
  | "events"
  | "gallery_albums"
  | "gallery_items"
  | "reviews"
  | "faqs"
  | "policy_sections";

/** Visible rows of a collection, ordered by `sort`. Falls back to seed data only if Supabase is unreachable. */
async function collection<T>(table: Table, fallback: T[]): Promise<T[]> {
  if (!isSupabaseConfigured) return fallback;
  const { data, error } = await publicClient()
    .from(table)
    .select("*")
    .eq("is_visible", true)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error(`[data] ${table}: ${error.message}`);
    return fallback;
  }
  return (data ?? []) as T[];
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  if (!isSupabaseConfigured) return seed.settings;
  const { data, error } = await publicClient().from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) console.error(`[data] site_settings: ${error.message}`);
  return withDefaults(seed.settings, data?.data);
}

export async function getPage<S extends PageSlug>(slug: S): Promise<Page<S>> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const fallback = seed.pages.find((p) => p.slug === slug) as Page<S>;
  if (!isSupabaseConfigured) return fallback;
  const { data, error } = await publicClient().from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) console.error(`[data] pages/${slug}: ${error.message}`);
  if (!data) return fallback;
  return {
    ...fallback,
    ...data,
    content: withDefaults(fallback.content, data.content),
  } as Page<S>;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("categories", seed.categories);
}

export async function getAttractions(): Promise<Attraction[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("attractions", seed.attractions);
}

export async function getAttraction(slug: string): Promise<Attraction | undefined> {
  return (await getAttractions()).find((a) => a.slug === slug);
}

/** Visible offers that have not ended yet (Kathmandu time). Offers starting later are shown with their dates. */
export async function getOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const today = todayInNepal();
  const offers = await collection("offers", seed.offers);
  return offers.filter((o) => !o.ends_on || o.ends_on >= today);
}

export async function getPowerplayTiers(): Promise<PowerplayTier[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("powerplay_tiers", seed.powerplayTiers);
}

export async function getEventTypes(): Promise<EventType[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("event_types", seed.eventTypes);
}

/** Upcoming events: undated ones, and dated ones from today onwards. */
export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const today = todayInNepal();
  const events = await collection("events", seed.upcomingEvents);
  return events.filter((e) => !e.event_date || e.event_date >= today);
}

export async function getGallery(): Promise<Array<GalleryAlbum & { items: GalleryItem[] }>> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const [albums, items] = await Promise.all([
    collection("gallery_albums", seed.galleryAlbums),
    collection("gallery_items", seed.galleryItems),
  ]);
  return albums.map((album) => ({ ...album, items: items.filter((i) => i.album_slug === album.slug) }));
}

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("reviews", seed.reviews);
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("faqs", seed.faqs);
}

export async function getPolicySections(): Promise<PolicySection[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return collection("policy_sections", seed.policySections);
}

export type MediaMap = Record<string, MediaRecord>;

/** The whole media library keyed by path (used to resolve image sizes, alt text and blur placeholders). */
export async function getMediaMap(): Promise<MediaMap> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const rows: MediaRecord[] = [];
  if (!isSupabaseConfigured) {
    rows.push(...seed.media);
  } else {
    const client = publicClient();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from("media").select("*").order("path").range(from, from + 999);
      if (error) {
        console.error(`[data] media: ${error.message}`);
        if (from === 0) rows.push(...seed.media);
        break;
      }
      rows.push(...((data ?? []) as MediaRecord[]));
      if (!data || data.length < 1000) break;
    }
  }
  return Object.fromEntries(rows.map((m) => [m.path, m]));
}

export async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

import type { Metadata } from "next";
import { plain } from "@/components/site/highlight";
import { getMediaMap, getPage } from "@/lib/data";
import { imageUrl, toImage } from "@/lib/media";
import type { PageSlug } from "@/lib/types";

/** Metadata for a CMS-managed page (title/description/OG image are all editable in /admin). */
export async function pageMetadata(slug: PageSlug, path: string): Promise<Metadata> {
  const [page, media] = await Promise.all([getPage(slug), getMediaMap()]);
  const title = page.seo_title || plain(page.title);
  const description = page.seo_description || undefined;
  const og = imageUrl(toImage(media, page.og_image), 1600);
  return {
    title: slug === "home" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, ...(og ? { images: [{ url: og }] } : {}) },
  };
}

import type { MetadataRoute } from "next";
import { getAttractions, getSettings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, attractions] = await Promise.all([getSettings(), getAttractions()]);
  const base = settings.seo.siteUrl.replace(/\/$/, "");
  const pages = ["", "/attractions", "/prices-offers", "/events", "/gallery", "/about", "/contact", "/faq", "/terms"];
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: path === "/prices-offers" || path === "/events" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...attractions.map((a) => ({ url: `${base}/attractions/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

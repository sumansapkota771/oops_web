import { GalleryTabs, type GalleryAlbumView } from "@/components/site/gallery-tabs";
import { PageHero } from "@/components/site/page-hero";
import { Container, Section } from "@/components/ui/section";
import { getGallery, getMediaMap, getPage } from "@/lib/data";
import { toImage } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("gallery", "/gallery");

export default async function GalleryPage() {
  const [page, albums, media] = await Promise.all([getPage("gallery"), getGallery(), getMediaMap()]);
  const views: GalleryAlbumView[] = albums
    .map((album) => ({
      slug: album.slug,
      title: album.title,
      description: album.description,
      layout: album.layout,
      items: album.items.flatMap((item) => {
        const image = toImage(media, item.image, item.caption ? `${item.caption} at OOPS! Nepal` : undefined);
        return image ? [{ image, caption: item.caption }] : [];
      }),
    }))
    .filter((a) => a.items.length);

  return (
    <>
      <PageHero copy={page.content.hero} />
      <Section className="pt-4 sm:pt-6">
        <Container>
          <GalleryTabs albums={views} />
        </Container>
      </Section>
    </>
  );
}

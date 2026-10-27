import { notFound } from "next/navigation";
import { ItemList } from "@/components/admin/item-list";
import { MediaProvider } from "@/components/admin/media-picker";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { COLLECTIONS, isCollection } from "@/lib/admin/collections";
import { formContext } from "@/lib/admin/context";
import type { Option } from "@/lib/admin/fields";
import { canWrite, getMediaByPaths, listRows } from "@/lib/admin/store";

export const metadata = { title: "Content" };

// Admin pages are per-user and read route params at request time.
export const instant = false;

export default async function CollectionPage({ params }: PageProps<"/admin/[collection]">) {
  await requireAdmin();
  const { collection: key } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  const rows = await listRows(key);

  // Thumbnails for the list.
  const imageField = collection.imageField;
  const media = imageField ? await getMediaByPaths(rows.map((r) => r[imageField] as string).filter(Boolean)) : [];

  // Filter options for grouped lists (gallery photos by album, policies by group).
  let groups: Option[] | undefined;
  if (collection.groupBy === "album_slug") groups = (await formContext(collection.fields, [])).ctx.albums;
  if (collection.groupBy === "group_key") {
    const field = collection.fields.find((f) => f.name === "group_key");
    if (field?.type === "select" && Array.isArray(field.options)) groups = field.options;
  }

  return (
    <>
      <PageTitle title={collection.label} subtitle={collection.description} />
      <MediaProvider initial={Object.fromEntries(media.map((m) => [m.path, m]))}>
        <ItemList collection={collection} rows={rows} groups={groups} canEdit={canWrite()} />
      </MediaProvider>
    </>
  );
}

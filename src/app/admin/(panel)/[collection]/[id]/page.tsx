import { notFound } from "next/navigation";
import { DocForm } from "@/components/admin/doc-form";
import { MediaProvider } from "@/components/admin/media-picker";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { COLLECTIONS, isCollection } from "@/lib/admin/collections";
import { formContext } from "@/lib/admin/context";
import { canWrite, getRow } from "@/lib/admin/store";
import { deleteItemAction, saveItemAction } from "../../../actions";

export const metadata = { title: "Edit item" };

// Admin pages are per-user and read route params at request time.
export const instant = false;

export default async function EditItemPage({ params }: PageProps<"/admin/[collection]/[id]">) {
  await requireAdmin();
  const { collection: key, id } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  const row = await getRow(key, id);
  if (!row) notFound();
  const { ctx, media } = await formContext(collection.fields, [row]);
  const title = String(row[collection.titleField] ?? collection.singular);
  const slug = collection.slugField ? String(row[collection.slugField] ?? "") : "";
  const viewHref = key === "attractions" && slug ? `/attractions/${slug}` : key === "offers" ? "/prices-offers" : undefined;
  return (
    <>
      <PageTitle title={title} subtitle={`Editing ${collection.singular.toLowerCase()}`} />
      <MediaProvider initial={media}>
        <DocForm
          fields={collection.fields}
          initial={row}
          ctx={ctx}
          save={saveItemAction.bind(null, key, id)}
          onDelete={deleteItemAction.bind(null, key, id)}
          backHref={`/admin/${key}`}
          viewHref={viewHref}
          readOnlyReason={canWrite() ? undefined : "Connect Supabase to save changes."}
        />
      </MediaProvider>
    </>
  );
}

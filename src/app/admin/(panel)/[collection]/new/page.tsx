import { notFound } from "next/navigation";
import { DocForm } from "@/components/admin/doc-form";
import { MediaProvider } from "@/components/admin/media-picker";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { COLLECTIONS, isCollection } from "@/lib/admin/collections";
import { formContext } from "@/lib/admin/context";
import { emptyDoc } from "@/lib/admin/fields";
import { canWrite } from "@/lib/admin/store";
import { saveItemAction } from "../../../actions";

export const metadata = { title: "New item" };

// Admin pages are per-user and read route params at request time.
export const instant = false;

export default async function NewItemPage({ params }: PageProps<"/admin/[collection]/new">) {
  await requireAdmin();
  const { collection: key } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  const initial = { ...emptyDoc(collection.fields), ...collection.defaults };
  const { ctx, media } = await formContext(collection.fields, []);
  return (
    <>
      <PageTitle title={`New ${collection.singular.toLowerCase()}`} subtitle={collection.description} />
      <MediaProvider initial={media}>
        <DocForm
          fields={collection.fields}
          initial={initial}
          ctx={ctx}
          save={saveItemAction.bind(null, key, null)}
          afterCreateBase={`/admin/${key}`}
          backHref={`/admin/${key}`}
          readOnlyReason={canWrite() ? undefined : "Connect Supabase to save new items."}
        />
      </MediaProvider>
    </>
  );
}

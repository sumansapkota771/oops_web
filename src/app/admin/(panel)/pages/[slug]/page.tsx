import { notFound } from "next/navigation";
import { DocForm } from "@/components/admin/doc-form";
import { MediaProvider } from "@/components/admin/media-picker";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formContext } from "@/lib/admin/context";
import { group, type Doc } from "@/lib/admin/fields";
import { PAGE_FIELDS, PAGE_LABELS, PAGE_PATHS, PAGE_SEO_FIELDS } from "@/lib/admin/page-schemas";
import { getPageDoc } from "@/lib/admin/store";
import type { PageSlug } from "@/lib/types";
import { savePageAction } from "../../../actions";

export const metadata = { title: "Edit page" };

// Admin pages are per-user and read route params at request time.
export const instant = false;

export default async function EditPage({ params }: PageProps<"/admin/pages/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  if (!Object.hasOwn(PAGE_FIELDS, slug)) notFound();
  const key = slug as PageSlug;
  const page = await getPageDoc(key);
  // Form shape: { title, seo_title, seo_description, og_image, content: {...} }
  const fields = [...PAGE_SEO_FIELDS, group("content", "Page content", PAGE_FIELDS[key])];
  const doc = {
    title: page.title,
    seo_title: page.seo_title ?? "",
    seo_description: page.seo_description ?? "",
    og_image: page.og_image,
    content: page.content,
  } as unknown as Doc;
  const { ctx, media } = await formContext(fields, [doc]);
  return (
    <>
      <PageTitle title={PAGE_LABELS[key]} subtitle={`Public address: ${PAGE_PATHS[key]}. Wrap words in *asterisks* in a title to colour them.`} />
      <MediaProvider initial={media}>
        <DocForm fields={fields} initial={doc} ctx={ctx} save={savePageAction.bind(null, key)} backHref="/admin/pages" viewHref={PAGE_PATHS[key]} />
      </MediaProvider>
    </>
  );
}

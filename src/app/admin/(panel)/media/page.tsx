import { MediaLibrary } from "@/components/admin/media-library";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { canWrite } from "@/lib/admin/store";

export const metadata = { title: "Media library" };

// Admin pages are per-user and load live data on every visit.
export const instant = false;

export default async function MediaPage() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Media library" subtitle="Every photo and video used on the website. Upload new ones here or straight from any photo picker." />
      <MediaLibrary canEdit={canWrite()} />
    </>
  );
}

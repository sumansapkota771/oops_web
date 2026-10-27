import { Enquiries } from "@/components/admin/enquiries";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { canWrite, listEnquiries } from "@/lib/admin/store";

export const metadata = { title: "Enquiries" };

// Admin pages are per-user and load live data on every visit.
export const instant = false;

export default async function EnquiriesPage() {
  await requireAdmin();
  const rows = await listEnquiries("all");
  return (
    <>
      <PageTitle title="Enquiries" subtitle="Messages from the Book Now and Contact forms. Exports are saved to the private “data” bucket." />
      <Enquiries rows={rows} canEdit={canWrite()} />
    </>
  );
}

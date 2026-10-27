import { DocForm } from "@/components/admin/doc-form";
import { MediaProvider } from "@/components/admin/media-picker";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formContext } from "@/lib/admin/context";
import type { Doc } from "@/lib/admin/fields";
import { SETTINGS_FIELDS } from "@/lib/admin/page-schemas";
import { getSettingsDoc } from "@/lib/admin/store";
import { saveSettingsAction } from "../../actions";

export const metadata = { title: "Site settings" };

// Admin pages are per-user and load live data on every visit.
export const instant = false;

export default async function SettingsPage() {
  await requireAdmin();
  const settings = (await getSettingsDoc()) as unknown as Doc;
  const { ctx, media } = await formContext(SETTINGS_FIELDS, [settings]);
  return (
    <>
      <PageTitle title="Site settings" subtitle="Contact details, opening hours, social links, menu, footer and search-engine defaults." />
      <MediaProvider initial={media}>
        <DocForm fields={SETTINGS_FIELDS} initial={settings} ctx={ctx} save={saveSettingsAction} />
      </MediaProvider>
    </>
  );
}

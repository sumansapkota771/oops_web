import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { PAGE_LABELS, PAGE_PATHS } from "@/lib/admin/page-schemas";
import type { PageSlug } from "@/lib/types";

export const metadata = { title: "Pages" };

// Admin pages are per-user and load live data on every visit.
export const instant = false;

export default async function PagesIndex() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Pages" subtitle="Edit the headings, text, buttons, photos and videos of every page." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(PAGE_LABELS) as PageSlug[]).map((slug) => (
          <li key={slug}>
            <Link href={`/admin/pages/${slug}`} className="flex min-h-16 items-center justify-between rounded-2xl bg-space-850 px-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] hover:bg-space-800">
              <span className="font-semibold">{PAGE_LABELS[slug]}</span>
              <span className="text-xs text-subtle">{PAGE_PATHS[slug]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

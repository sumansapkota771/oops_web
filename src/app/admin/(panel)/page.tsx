import Link from "next/link";
import { Card, PageTitle } from "@/components/admin/ui";
import { COLLECTION_ORDER, COLLECTIONS } from "@/lib/admin/collections";
import { canWrite, countRows, listEnquiries } from "@/lib/admin/store";
import { isSupabaseConfigured } from "@/lib/env";
import { telHref } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

// Admin pages are per-user and load live data on every visit.
export const instant = false;

export default async function Dashboard() {
  const [counts, newEnquiries, latest] = await Promise.all([
    Promise.all(COLLECTION_ORDER.map(async (key) => [key, await countRows(key)] as const)),
    countRows("enquiries", ["status", "new"]),
    listEnquiries("all").then((r) => r.slice(0, 5)),
  ]);
  const checks = [
    { ok: isSupabaseConfigured && canWrite(), label: "Supabase database & buckets" },
    { ok: Boolean(process.env.ADMIN_SESSION_SECRET), label: "Admin sign-in" },
    { ok: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS), label: "Enquiry emails (Gmail)" },
  ];

  return (
    <>
      <PageTitle title="Dashboard" subtitle="Everything on the website is edited here. Changes appear on the site immediately after you save.">
        <Link href="/" target="_blank" className="inline-flex min-h-10 items-center rounded-xl bg-white/[0.07] px-4 text-xs font-semibold uppercase tracking-wider hover:bg-white/[0.13]">
          View website ↗
        </Link>
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-sea-300">Content</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {COLLECTION_ORDER.map((key, i) => (
              <li key={key}>
                <Link href={`/admin/${key}`} className="flex min-h-12 items-center justify-between rounded-xl bg-white/[0.04] px-4 hover:bg-white/[0.09]">
                  <span className="text-sm font-medium">{COLLECTIONS[key].label}</span>
                  <span className="text-sm text-subtle">{counts[i][1] ?? "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-sea-300">Setup</h2>
          <ul className="flex flex-col gap-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span className={`size-2.5 rounded-full ${c.ok ? "bg-green" : "bg-yellow"}`} aria-hidden />
                <span className={c.ok ? "" : "text-muted"}>{c.label}</span>
                <span className="sr-only">{c.ok ? "connected" : "needs setup"}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/setup" className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-sea-300 hover:underline">
            Setup guide →
          </Link>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-sea-300">
            Latest enquiries{" "}
            {newEnquiries ? <span className="ml-2 rounded-full bg-yellow px-2 py-0.5 text-[0.65rem] text-space-950">{newEnquiries} new</span> : null}
          </h2>
          <Link href="/admin/enquiries" className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink">
            View all →
          </Link>
        </div>
        {latest.length ? (
          <ul className="divide-y divide-white/[0.07]">
            {latest.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <strong>{e.name}</strong>
                <a href={telHref(e.phone)} className="text-sea-300">
                  {e.phone}
                </a>
                <span className="min-w-0 flex-1 truncate text-muted">{e.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No enquiries yet.</p>
        )}
      </Card>
    </>
  );
}

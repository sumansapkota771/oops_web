import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/auth-actions";
import { AdminShell, type NavGroup } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/auth";
import { COLLECTION_ORDER, COLLECTIONS } from "@/lib/admin/collections";
import { PAGE_LABELS } from "@/lib/admin/page-schemas";
import type { PageSlug } from "@/lib/types";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const groups: NavGroup[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
    { title: "Pages", items: (Object.keys(PAGE_LABELS) as PageSlug[]).map((slug) => ({ href: `/admin/pages/${slug}`, label: PAGE_LABELS[slug] })) },
    { title: "Content", items: COLLECTION_ORDER.map((key) => ({ href: `/admin/${key}`, label: COLLECTIONS[key].label })) },
    {
      title: "Site",
      items: [
        { href: "/admin/settings", label: "Site settings" },
        { href: "/admin/media", label: "Media library" },
        { href: "/admin/enquiries", label: "Enquiries" },
        ...(user.role === "admin" ? [{ href: "/admin/users", label: "Users" }] : []),
      ],
    },
  ];

  return (
    <AdminShell
      groups={groups}
      user={
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/admin/account" className="min-w-0 rounded-lg hover:text-sea-200">
            <span className="block truncate font-semibold">{user.name}</span>
            <span className="block truncate text-xs capitalize text-subtle">{user.role}</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="min-h-9 rounded-lg px-1 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      }
    >
      {user.mustChangePassword ? (
        <p className="mb-6 rounded-xl bg-yellow/10 px-4 py-3 text-sm text-[#ffe07a]">
          You’re using a temporary password. Please{" "}
          <Link href="/admin/account" className="font-semibold underline">
            choose your own
          </Link>
          .
        </p>
      ) : null}
      {children}
    </AdminShell>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ListIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type NavGroup = { title: string; items: Array<{ href: string; label: string }> };

export function AdminShell({ groups, user, children }: { groups: NavGroup[]; user: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-subtle">{g.title}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? "page" : undefined}
                  className={cn("flex min-h-10 items-center rounded-xl px-3 text-sm font-medium transition-colors", active(item.href) ? "bg-sea-400/15 text-sea-200" : "text-muted hover:bg-white/[0.06] hover:text-ink")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-space-950 lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="hidden max-h-dvh overflow-y-auto border-r border-white/[0.07] bg-space-900 p-4 lg:sticky lg:top-0 lg:block">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-3 py-2 text-lg font-extrabold uppercase tracking-tight">
          OOPS! <span className="text-sea-300">Admin</span>
        </Link>
        {nav}
        <div className="mt-8 border-t border-white/[0.07] px-3 pt-4">{user}</div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.07] bg-space-900/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-xl bg-white/[0.07]">
          <ListIcon size={20} aria-hidden />
        </button>
        <span className="font-extrabold uppercase">
          OOPS! <span className="text-sea-300">Admin</span>
        </span>
        <div className="ml-auto">{user}</div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto overscroll-contain bg-space-900 p-4">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white/[0.07]">
              <XIcon size={18} aria-hidden />
            </button>
            {nav}
          </div>
        </div>
      ) : null}

      <main id="main" className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

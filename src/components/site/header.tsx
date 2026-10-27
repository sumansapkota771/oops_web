"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Img } from "@/components/ui/img";
import { PhoneIcon, SocialIcon, SOCIAL_LABEL } from "@/components/ui/icons";
import type { ImageData, Link as NavLink, SiteSettings } from "@/lib/types";
import { cn, telHref } from "@/lib/utils";

type Props = {
  nav: NavLink[];
  cta: SiteSettings["cta"];
  phone: string;
  hours: string;
  socials: SiteSettings["socials"];
  logo: ImageData | undefined;
  brandName: string;
  announcement: { text: string; href?: string } | null;
};

export function Header({ nav, cta, phone, hours, socials, logo, brandName, announcement }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = nav.filter((l) => l.href !== "/");

  return (
    <>
      <div ref={sentinel} className="absolute inset-x-0 top-0 h-px" aria-hidden />
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-space-950 focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        {announcement ? (
          <div
            className={cn(
              "transition-[transform,opacity] duration-700 ease-fluid",
              scrolled || open ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            <Link
              href={announcement.href || "/prices-offers"}
              className="flex min-h-9 items-center justify-center gap-2 bg-sea-600 px-4 py-2 text-center text-[0.72rem] font-semibold uppercase tracking-wider text-white sm:text-xs"
            >
              <span>{announcement.text}</span>
            </Link>
          </div>
        ) : null}

        <div
          className={cn(
            "px-3 transition-transform duration-700 ease-fluid sm:px-4",
            announcement && (scrolled || open) ? "-translate-y-9" : "translate-y-0",
          )}
        >
          <nav
            aria-label="Main"
            className="glass mx-auto mt-3 flex w-full max-w-6xl items-center gap-2 rounded-full py-2 pl-4 pr-2 sm:pl-5"
          >
            <Link href="/" className="mr-auto flex shrink-0 items-center rounded-full" aria-label={`${brandName} — home`}>
              <Img image={logo} sizes="120px" priority placeholder={false} className="h-9 w-auto sm:h-10" alt={brandName} />
            </Link>

            <ul className="hidden items-center gap-0.5 lg:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center rounded-full px-3 text-[0.72rem] font-semibold uppercase tracking-wider transition-colors duration-300 xl:px-4 xl:text-[0.78rem]",
                      isActive(link.href) ? "bg-white/10 text-white" : "text-muted hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <a
              href={telHref(phone)}
              className="hidden size-11 items-center justify-center rounded-full bg-white/[0.06] text-ink transition-colors hover:bg-white/[0.12] sm:flex"
              aria-label={`${cta.callLabel}: ${phone}`}
            >
              <PhoneIcon size={18} weight="bold" aria-hidden />
            </a>

            <Link
              href={cta.book.href}
              className={buttonClass("accent", "hidden min-h-11 px-5 text-[0.75rem] sm:inline-flex")}
            >
              {cta.book.label}
            </Link>

            <button
              ref={toggle}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex size-11 items-center justify-center rounded-full bg-white/[0.08] lg:hidden"
            >
              <span
                className={cn(
                  "absolute h-0.5 w-5 rounded-full bg-white transition-transform duration-500 ease-fluid",
                  open ? "rotate-45" : "-translate-y-[5px]",
                )}
              />
              <span
                className={cn(
                  "absolute h-0.5 w-5 rounded-full bg-white transition-transform duration-500 ease-fluid",
                  open ? "-rotate-45" : "translate-y-[5px]",
                )}
              />
            </button>
          </nav>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-space-950/85 px-6 pb-10 pt-28 backdrop-blur-3xl transition-opacity duration-500 ease-fluid lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="flex flex-col gap-1">
          {nav.map((link, i) => (
            <li
              key={link.href}
              className={cn(
                "transition-[transform,opacity] duration-700 ease-fluid",
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "heading flex min-h-14 items-center text-[2rem] leading-none sm:text-5xl",
                  isActive(link.href) ? "text-sea-300" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "mt-auto flex flex-col gap-5 transition-[transform,opacity] delay-300 duration-700 ease-fluid",
            open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={cta.book.href}
              className="inline-flex min-h-12 items-center rounded-full bg-yellow px-6 text-sm font-bold uppercase tracking-wider text-space-950"
            >
              {cta.book.label}
            </Link>
            <a
              href={telHref(phone)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-6 text-sm font-semibold uppercase tracking-wider"
            >
              <PhoneIcon size={18} weight="bold" aria-hidden /> {phone}
            </a>
          </div>
          <p className="text-sm text-muted">Open daily · {hours}</p>
          <ul className="flex gap-2">
            {socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={SOCIAL_LABEL[s.platform]}
                  className="flex size-11 items-center justify-center rounded-full bg-white/[0.07] text-ink hover:bg-white/[0.14]"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

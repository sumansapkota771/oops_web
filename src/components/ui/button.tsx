import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons follow the OOPS! logo: a bold coloured face with a hard offset "extrusion" behind it, like the 3D letters.
 * Each variant pairs a face colour with an extrusion colour taken from the logo's gradients.
 * Press them: they lift on hover and sink into their shadow when clicked.
 */
export type ButtonVariant = "primary" | "accent" | "green" | "pink" | "orange" | "purple" | "ghost";

const faces: Record<ButtonVariant, string> = {
  primary: "[--face:var(--color-sea-400)] [--edge:var(--color-purple)] [--on:var(--color-space-950)]",
  accent: "[--face:var(--color-yellow)] [--edge:var(--color-orange)] [--on:var(--color-space-950)]",
  green: "[--face:var(--color-green)] [--edge:var(--color-green-deep)] [--on:var(--color-space-950)]",
  pink: "[--face:var(--color-pink)] [--edge:var(--color-purple)] [--on:var(--color-space-950)]",
  orange: "[--face:var(--color-orange)] [--edge:var(--color-pink)] [--on:var(--color-space-950)]",
  purple: "[--face:var(--color-purple)] [--edge:var(--color-sea-400)] [--on:#fff]",
  ghost: "[--face:transparent] [--rim:rgb(255_255_255/0.85)] [--edge:var(--color-sea-400)] [--on:var(--color-ink)] hover:bg-white/10",
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border-2 border-(--rim,var(--face)) bg-(--face) px-7 py-3 text-[0.8rem] font-extrabold uppercase tracking-wider text-(--on) shadow-[4px_4px_0_var(--edge)] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--edge)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--edge)] disabled:pointer-events-none disabled:opacity-60";

/** Class string for anything that must look like a site button (links, submit buttons, the header CTA). */
export const buttonClass = (variant: ButtonVariant = "primary", className?: string) => cn(base, faces[variant], className);

type Common = { variant?: ButtonVariant; icon?: ReactNode | false };

function Inner({ children, icon }: { children: ReactNode; icon: ReactNode | false | undefined }) {
  return (
    <>
      {children}
      {icon ? <span aria-hidden>{icon}</span> : null}
    </>
  );
}

type LinkProps = Omit<ComponentProps<typeof Link>, "children"> & Common & { children: ReactNode };

/** Pass `icon` only when an icon genuinely helps (e.g. a phone number). */
export function ButtonLink({ children, variant = "primary", icon, className, ...props }: LinkProps) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  );
}

type AnchorProps = ComponentProps<"a"> & Common;

export function ButtonAnchor({ children, variant = "primary", icon, className, ...props }: AnchorProps) {
  return (
    <a className={buttonClass(variant, className)} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  );
}

type ButtonProps = ComponentProps<"button"> & Common;

export function Button({ children, variant = "primary", icon, className, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}

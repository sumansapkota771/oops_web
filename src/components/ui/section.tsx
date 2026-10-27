import type { ReactNode } from "react";
import type { SectionCopy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Highlight } from "@/components/site/highlight";
import { Reveal } from "./reveal";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[84rem] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-yellow", className)}>
      <span className="h-0.5 w-8 shrink-0 bg-yellow" aria-hidden />
      {children}
    </span>
  );
}

type HeadingProps = {
  copy: { eyebrow?: string; title: string; subtitle?: string } | SectionCopy;
  as?: "h1" | "h2";
  size?: "xl" | "lg" | "md";
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

const sizeClass = { xl: "heading-xl", lg: "heading-lg", md: "heading-md" } as const;

/** Eyebrow + bold uppercase heading + optional subtitle. */
export function SectionHeading({ copy, as: Tag = "h2", size = "lg", align = "left", className, children }: HeadingProps) {
  return (
    <Reveal className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      {copy.eyebrow ? <Eyebrow>{copy.eyebrow}</Eyebrow> : null}
      <Tag className={cn("heading", sizeClass[size], align === "center" ? "max-w-4xl" : "max-w-5xl")}>
        <Highlight text={copy.title} />
      </Tag>
      {copy.subtitle ? (
        <p className={cn("max-w-2xl text-base leading-relaxed text-muted sm:text-lg", align === "center" && "mx-auto")}>
          {copy.subtitle}
        </p>
      ) : null}
      {children}
    </Reveal>
  );
}

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-28 lg:py-32", className)}>
      {children}
    </section>
  );
}

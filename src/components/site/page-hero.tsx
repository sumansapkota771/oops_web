import type { ReactNode } from "react";
import { Img } from "@/components/ui/img";
import { Parallax } from "@/components/ui/parallax";
import { Reveal } from "@/components/ui/reveal";
import { Container, Eyebrow } from "@/components/ui/section";
import type { ImageData, SectionCopy } from "@/lib/types";
import { Highlight } from "./highlight";

/** Hero for inner pages: big uppercase title over an optional dimmed photo. */
export function PageHero({ copy, image, children }: { copy: SectionCopy; image?: ImageData; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-40 sm:pb-20 sm:pt-48">
      {image ? (
        <Parallax className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]" distance={8}>
          <Img image={image} priority sizes="100vw" alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/75 to-space-950/40" aria-hidden />
        </Parallax>
      ) : null}
      <Container>
        <Reveal stagger className="flex max-w-5xl flex-col gap-6">
          {copy.eyebrow ? <Eyebrow>{copy.eyebrow}</Eyebrow> : null}
          <h1 className="heading heading-xl">
            <Highlight text={copy.title} />
          </h1>
          {copy.subtitle ? <p className="max-w-2xl text-base leading-relaxed text-ink/80 sm:text-lg">{copy.subtitle}</p> : null}
          {children}
        </Reveal>
      </Container>
    </section>
  );
}

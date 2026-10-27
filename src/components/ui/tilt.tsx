"use client";

import gsap from "gsap";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Cards lean towards the pointer in 3D (mouse only; touch and reduced motion get a flat card).
 * Wrap the card, not the element that <Reveal> animates, so the two transforms never fight.
 */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
    // gsap.to, not quickTo: quickTo warns "not eligible for reset" when a target value equals the current one (e.g. 0 -> 0).
    const lean = (rotateX: number, rotateY: number, y: number) =>
      gsap.to(el, { rotateX, rotateY, y, duration: 0.5, ease: "power3.out", overwrite: "auto" });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      lean(-py * max * 2, px * max * 2, -4);
    };
    const leave = () => {
      lean(0, 0, 0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { clearProps: "opacity,transform" });
    };
  }, [max]);

  return (
    <div ref={ref} data-tilt className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

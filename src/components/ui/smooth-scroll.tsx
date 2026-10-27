"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** Jump to the top without animation (used when a new page opens). */
export function jumpToTop() {
  if (instance) instance.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

/**
 * Inertia scrolling (Lenis) wired into GSAP so ScrollTrigger animations follow the smoothed scroll.
 * Skipped for reduced motion. Dialogs, the mobile menu and anything marked data-lenis-prevent keep native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: { offset: -96 },
      prevent: (node) => Boolean(node.closest('[role="dialog"], .yarl__root, [data-lenis-prevent]')),
    });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  // A new page always starts at its hero: jump there instantly, then let the scroll animations re-measure the page.
  useEffect(() => {
    if (!window.location.hash) jumpToTop();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

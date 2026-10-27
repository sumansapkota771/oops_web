"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealVariant = "up" | "fade" | "tilt" | "left" | "right" | "zoom";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Milliseconds to wait before playing (use small steps for neighbouring cards). */
  delay?: number;
  /** "up" lifts in, "tilt" rotates in from below in 3D, "left"/"right" slide, "zoom" scales, "fade" only fades. */
  variant?: RevealVariant;
  /** Animate the direct children one after another instead of the element itself. */
  stagger?: boolean;
  style?: CSSProperties;
  id?: string;
};

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { y: 56 },
  fade: {},
  tilt: { y: 72, rotateX: 14, rotateY: -7, scale: 0.95, transformPerspective: 1100, transformOrigin: "50% 100%" },
  left: { x: -90 },
  right: { x: 90 },
  zoom: { scale: 0.86 },
};

const TO: gsap.TweenVars = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 };

/**
 * Scroll animation: plays when the element enters the viewport and plays backwards when it scrolls back out
 * below the fold, so content fades in and out as you move through the page.
 * Content stays visible if JavaScript never runs (the hidden state is only applied under .js) and with reduced motion.
 */
export function Reveal({ children, as: Tag = "div", className, delay = 0, variant = "up", stagger = false, style, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.reveal = "done";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const targets = stagger ? Array.from(el.children) : el;
    const tween = gsap.fromTo(
      targets,
      { opacity: 0, ...FROM[variant] },
      { ...TO, duration: stagger ? 0.9 : 1.05, ease: "power3.out", delay: delay / 1000, stagger: stagger ? 0.11 : 0, paused: true },
    );
    // From here GSAP owns the hidden state, so the CSS fallback can step aside.
    el.dataset.reveal = "ready";

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => tween.play(),
      onLeave: () => tween.play(), // landing further down the page (reload, anchor link) must not leave anything hidden
      onLeaveBack: () => tween.reverse(),
    });
    return () => {
      trigger.kill();
      tween.kill();
      gsap.set(targets, { clearProps: "opacity,transform" });
    };
  }, [delay, variant, stagger]);

  return (
    <Tag ref={ref} id={id} data-reveal={stagger ? "stagger" : "out"} className={className} style={style}>
      {children}
    </Tag>
  );
}

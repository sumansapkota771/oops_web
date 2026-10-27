import type { Accent } from "@/lib/types";

/** Logo accent colours, tuned for AA contrast on the dark space background. */
export const ACCENTS: Record<Accent, { text: string; chip: string; dot: string; glow: string }> = {
  sea: { text: "text-sea-300", chip: "bg-sea-400/15 text-sea-200", dot: "bg-sea-300", glow: "from-sea-400/40" },
  orange: { text: "text-[#ff9a5c]", chip: "bg-orange/15 text-[#ffb07f]", dot: "bg-orange", glow: "from-orange/40" },
  yellow: { text: "text-[#ffd54a]", chip: "bg-yellow/15 text-[#ffe07a]", dot: "bg-yellow", glow: "from-yellow/40" },
  green: { text: "text-[#9be05c]", chip: "bg-green/15 text-[#b5ea85]", dot: "bg-green", glow: "from-green/40" },
  pink: { text: "text-[#ff7ab5]", chip: "bg-pink/15 text-[#ff9cc8]", dot: "bg-pink", glow: "from-pink/40" },
  purple: { text: "text-[#b794ff]", chip: "bg-purple/20 text-[#c9adff]", dot: "bg-purple", glow: "from-purple/40" },
};

export const ACCENT_ORDER: Accent[] = ["sea", "orange", "green", "purple", "pink", "yellow"];

export function accentFor(value: string | null | undefined): Accent {
  return (value && value in ACCENTS ? value : "sea") as Accent;
}

/** Outline + extrusion colours for cards, matching the logo's coloured letters. */
export const ACCENT_VARS: Record<Accent, Record<string, string>> = {
  sea: { "--accent": "var(--color-sea-400)", "--accent-edge": "var(--color-purple)" },
  orange: { "--accent": "var(--color-orange)", "--accent-edge": "var(--color-yellow)" },
  yellow: { "--accent": "var(--color-yellow)", "--accent-edge": "var(--color-orange)" },
  green: { "--accent": "var(--color-green)", "--accent-edge": "var(--color-green-deep)" },
  pink: { "--accent": "var(--color-pink)", "--accent-edge": "var(--color-orange)" },
  purple: { "--accent": "var(--color-purple)", "--accent-edge": "var(--color-sea-400)" },
};

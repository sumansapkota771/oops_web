import { Fragment } from "react";

/** Renders text where *wrapped words* get the gradient highlight (editors can use this in any title). */
export function Highlight({ text, className = "text-gradient" }: { text: string; className?: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export const plain = (text: string) => text.replaceAll("*", "");

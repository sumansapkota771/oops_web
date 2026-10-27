"use client";

import { createContext, useCallback, useContext, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
type Toast = { id: number; kind: "ok" | "error"; text: string; href?: string };
const ToastContext = createContext<(kind: Toast["kind"], text: string, href?: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string, href?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text, href }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 4500);
  }, []);
  return (
    <ToastContext value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto max-w-lg rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl",
              t.kind === "ok" ? "bg-green text-space-950" : "bg-pink text-space-950",
            )}
          >
            {t.text}
            {t.href ? (
              <>
                {" "}
                <a href={t.href} className="underline">
                  Download
                </a>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
export const inputClass =
  "w-full rounded-xl bg-space-950/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-sea-400)]";

type Variant = "primary" | "ghost" | "danger" | "quiet";
const variants: Record<Variant, string> = {
  primary: "bg-sea-400 text-space-950 hover:bg-sea-300",
  ghost: "bg-white/[0.07] text-ink hover:bg-white/[0.13]",
  danger: "bg-pink/15 text-[#ff9cc8] hover:bg-pink/30",
  quiet: "text-muted hover:bg-white/[0.07] hover:text-ink",
};

export function AButton({ variant = "ghost", className, type = "button", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold uppercase tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-green" : "bg-white/20")}
    >
      <span className={cn("absolute top-1 size-5 rounded-full bg-white transition-all", checked ? "left-6" : "left-1")} />
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-space-850 p-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] sm:p-6", className)}>{children}</div>;
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

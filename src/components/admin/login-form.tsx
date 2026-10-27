"use client";

import { useActionState, useState } from "react";
import { loginAction, type FormState } from "@/app/admin/auth-actions";
import { EyeIcon, EyeSlashIcon, SpinnerGapIcon, WarningIcon } from "@/components/ui/icons";
import { inputClass } from "./ui";

const initial: FormState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" spellCheck={false} required autoFocus className={inputClass} placeholder="you@gmail.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Password
        </label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${inputClass} pr-12`} placeholder="Your password" />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            {show ? <EyeSlashIcon size={18} aria-hidden /> : <EyeIcon size={18} aria-hidden />}
          </button>
        </div>
      </div>
      {state.status === "error" && state.message ? (
        <p className="flex items-start gap-2 rounded-xl bg-pink/10 px-4 py-3 text-sm text-[#ffc2dc]" role="alert">
          <WarningIcon size={18} className="mt-0.5 shrink-0" aria-hidden /> {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sea-400 px-6 text-sm font-bold uppercase tracking-wider text-space-950 transition-colors hover:bg-sea-300 disabled:opacity-70"
      >
        {pending ? (
          <>
            <SpinnerGapIcon size={18} className="animate-spin" aria-hidden /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

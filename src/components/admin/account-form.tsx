"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type FormState } from "@/app/admin/auth-actions";
import { CheckIcon, SpinnerGapIcon } from "@/components/ui/icons";
import { AButton, inputClass } from "./ui";

const initial: FormState = { status: "idle" };

function Field({ id, label, error, hint, ...props }: React.ComponentProps<"input"> & { label: string; error?: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={inputClass} {...props} />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#ff9cc8]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function AccountForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = state.errors ?? {};
  return (
    <form ref={formRef} action={action} className="flex max-w-md flex-col gap-5">
      <Field id="current" name="current" type="password" label="Current password" autoComplete="current-password" required error={err.current} />
      <Field id="next" name="next" type="password" label="New password" autoComplete="new-password" required error={err.next} hint="At least 10 characters, with letters and numbers." />
      <Field id="confirm" name="confirm" type="password" label="Repeat new password" autoComplete="new-password" required error={err.confirm} />
      {state.status === "error" && state.message ? (
        <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-[#ffc2dc]" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="flex items-center gap-2 rounded-xl bg-green/15 px-4 py-3 text-sm text-[#c9f29d]" role="status">
          <CheckIcon size={18} weight="bold" aria-hidden /> {state.message}
        </p>
      ) : null}
      <AButton type="submit" variant="primary" disabled={pending} className="w-fit">
        {pending ? (
          <>
            <SpinnerGapIcon size={16} className="animate-spin" aria-hidden /> Saving…
          </>
        ) : (
          "Change password"
        )}
      </AButton>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { CheckIcon, SpinnerGapIcon, WarningIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: EnquiryState = { status: "idle" };

const field =
  "w-full rounded-2xl bg-space-950/60 px-4 py-3.5 text-base text-ink placeholder:text-subtle shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] outline-none transition-shadow duration-300 focus:shadow-[inset_0_0_0_2px_var(--color-sea-400)] aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-pink)]";

function Form({ source, successMessage, onDone }: { source: string; successMessage: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);
  // When the form appeared; the server rejects submissions that arrive impossibly fast (bots). Kept in a ref because
  // the browser clears form fields after every submit.
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  // After a failed submit, move focus to the first field with an error.
  useEffect(() => {
    if (state.status !== "error" || !state.errors) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-5 py-6" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-green/20 text-[#9be05c]">
          <CheckIcon size={28} weight="bold" aria-hidden />
        </span>
        <p className="heading heading-sm">Message sent</p>
        <p className="text-muted">{successMessage}</p>
        <button type="button" onClick={onDone} className="min-h-11 text-sm font-semibold uppercase tracking-wider text-sea-300 hover:text-sea-200">
          Send another message
        </button>
      </div>
    );
  }

  const err = state.errors ?? {};
  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("ts", String(openedAt.current));
        action(formData);
      }}
      noValidate className="flex flex-col gap-5">
      <input type="hidden" name="source" value={source} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${source}-name`} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Name
          </label>
          <input
            id={`${source}-name`}
            name="name"
            autoComplete="name"
            required
            defaultValue={state.values?.name}
            aria-invalid={Boolean(err.name)}
            aria-describedby={err.name ? `${source}-name-error` : undefined}
            className={field}
            placeholder="e.g. Sita Sharma…"
          />
          {err.name ? (
            <p id={`${source}-name-error`} className="text-sm text-[#ff9cc8]">
              {err.name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${source}-phone`} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Number
          </label>
          <input
            id={`${source}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            defaultValue={state.values?.phone}
            aria-invalid={Boolean(err.phone)}
            aria-describedby={err.phone ? `${source}-phone-error` : undefined}
            spellCheck={false}
            className={field}
            placeholder="e.g. 98XXXXXXXX"
          />
          {err.phone ? (
            <p id={`${source}-phone-error`} className="text-sm text-[#ff9cc8]">
              {err.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${source}-email`} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Email <span className="font-normal normal-case tracking-normal text-subtle">(optional)</span>
        </label>
        <input
          id={`${source}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={state.values?.email}
          aria-invalid={Boolean(err.email)}
          aria-describedby={err.email ? `${source}-email-error` : undefined}
          className={field}
          placeholder="e.g. name@gmail.com"
        />
        {err.email ? (
          <p id={`${source}-email-error`} className="text-sm text-[#ff9cc8]">
            {err.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${source}-message`} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Message
        </label>
        <textarea
          id={`${source}-message`}
          name="message"
          rows={5}
          defaultValue={state.values?.message}
          aria-invalid={Boolean(err.message)}
          aria-describedby={err.message ? `${source}-message-error` : undefined}
          className={cn(field, "resize-y")}
          placeholder="What are you celebrating? Date, number of guests, anything we should know…"
        />
        {err.message ? (
          <p id={`${source}-message-error`} className="text-sm text-[#ff9cc8]">
            {err.message}
          </p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p className="flex items-center gap-2 rounded-2xl bg-pink/10 px-4 py-3 text-sm text-[#ffc2dc]" role="alert">
          <WarningIcon size={18} aria-hidden /> {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("accent", "min-h-13 w-fit px-8 text-sm")}
      >
        {pending ? (
          <>
            <SpinnerGapIcon size={18} className="animate-spin" aria-hidden /> Sending…
          </>
        ) : (
          "Send enquiry"
        )}
      </button>
    </form>
  );
}

/** "Book now" form: Name, Number, Message (as specified by the client). */
export function EnquiryForm({ source, successMessage }: { source: string; successMessage: string }) {
  const [round, setRound] = useState(0);
  return <Form key={round} source={source} successMessage={successMessage} onDone={() => setRound((r) => r + 1)} />;
}

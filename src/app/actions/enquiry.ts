"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getSettings } from "@/lib/data";
import { sendEnquiryConfirmation, sendEnquiryEmail } from "@/lib/email";
import { hasServiceRole, serviceClient } from "@/lib/supabase/server";

type Field = "name" | "phone" | "email" | "message";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Field, string>>;
};

// Single-line fields end up in email headers and subjects: drop control characters (header injection).
const oneLine = (v: string) => v.replace(/[\u0000-\u001f\u007f]+/g, " ");

const schema = z.object({
  name: z.string().transform(oneLine).pipe(z.string().trim().min(2, "Please enter your name.").max(80, "Please use a shorter name.")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number, e.g. 98XXXXXXXX."),
  email: z
    .string()
    .trim()
    .max(120, "Please use a shorter email address.")
    .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Please enter a valid email address, e.g. name@gmail.com."),
  message: z.string().trim().max(1200, "Please keep your message under 1,200 characters."),
  source: z.string().trim().max(80).optional(),
});

// Best-effort throttle per server instance: 5 enquiries per IP every 10 minutes.
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  // The client IP can be spoofed behind some proxies, so also cap the whole site (protects the inboxes and the Gmail quota).
  const all = [...recent.values()].reduce((n, list) => n + list.filter((t) => now - t < WINDOW_MS).length, 0);
  if (recent.size > 5000) recent.clear();
  return hits.length > 5 || all > 60;
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  console.info(`[enquiry] received from "${String(formData.get("name") ?? "").slice(0, 40)}" (page: ${String(formData.get("source") ?? "?")})`);
  const settings = await getSettings();
  const phoneFallback = settings.contact.managementPhone;

  // Bot check: a real browser reports when the form opened, and people take more than a couple of seconds to fill it in.
  const openedAt = Number(formData.get("ts"));
  const age = Date.now() - openedAt;
  if (!Number.isFinite(openedAt) || openedAt <= 0 || age < 2000 || age > 24 * 3600_000) {
    console.warn(`[enquiry] rejected, failed the bot check (form age: ${Number.isFinite(age) ? `${Math.round(age / 1000)}s` : "missing"})`);
    return { status: "error", message: "Please wait a moment, then press Send again. If it keeps failing, reload the page or call us.", values: {
      name: String(formData.get("name") ?? ""), phone: String(formData.get("phone") ?? ""), email: String(formData.get("email") ?? ""), message: String(formData.get("message") ?? ""),
    } };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = schema.safeParse({ ...values, source: String(formData.get("source") ?? "") || undefined });
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    console.info(`[enquiry] rejected, invalid: ${Object.keys(fieldErrors).join(", ")}`);
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { name: fieldErrors.name?.[0], phone: fieldErrors.phone?.[0], email: fieldErrors.email?.[0], message: fieldErrors.message?.[0] },
      values,
    };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // The rate limit protects the live site; it is off in development so repeated testing never blocks you.
  if (process.env.NODE_ENV === "production" && throttled(ip)) {
    console.info(`[enquiry] rejected, too many messages from ${ip}`);
    return { status: "error", message: `Too many messages — please call us on ${phoneFallback}.`, values };
  }

  const enquiry = parsed.data;
  let stored = false;
  if (hasServiceRole()) {
    const { error } = await serviceClient()
      .from("enquiries")
      .insert({ name: enquiry.name, phone: enquiry.phone, email: enquiry.email || null, message: enquiry.message || null, source: enquiry.source ?? null });
    if (error) console.error("[enquiry] save failed:", error.message);
    stored = !error;
  }
  const [emailed, confirmed] = await Promise.all([
    sendEnquiryEmail(enquiry, settings.contact.managementEmail),
    sendEnquiryConfirmation(enquiry, phoneFallback),
  ]);
  console.info(`[enquiry] result: saved=${stored} emailed=${emailed} confirmation=${enquiry.email ? confirmed : "n/a"}`);

  if (!stored && !emailed) {
    // Only pretend success on a developer machine where nothing is configured at all; a failed save must never look like success.
    if (process.env.NODE_ENV !== "production" && !hasServiceRole()) {
      console.info("[enquiry] (not stored or emailed — Supabase/SMTP not configured yet)", enquiry);
      return { status: "success" };
    }
    return {
      status: "error",
      message: `Sorry, we couldn't send your message right now. Please call us on ${phoneFallback}.`,
      values,
    };
  }
  return { status: "success" };
}

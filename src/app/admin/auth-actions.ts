"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { assertAdmin, authProblem } from "@/lib/admin/auth";
import { fingerprint, hashPassword, passwordProblem, verifyPassword } from "@/lib/admin/password";
import { endSession, startSession } from "@/lib/admin/session";
import { serviceClient } from "@/lib/supabase/server";

export type FormState = { status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string> };

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

// Per-instance brake on password guessing from one address (the database lock below is the durable one).
const attempts = new Map<string, number[]>();
function tooManyFromIp(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 20;
}

// A real hash to compare against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = "scrypt:AAAAAAAAAAAAAAAAAAAAAA:" + "A".repeat(86);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

const GENERIC = "That email and password don't match. Check them and try again.";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const problem = authProblem();
  if (problem) return { status: "error", message: `Sign-in isn't set up yet: ${problem}.` };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", message: GENERIC };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (process.env.NODE_ENV === "production" && tooManyFromIp(ip)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const { email, password } = parsed.data;
  const db = serviceClient();
  const { data: user } = await db
    .from("admin_users")
    .select("id, password_hash, is_active, failed_attempts, locked_until")
    .eq("email", email)
    .maybeSingle();

  if (user?.locked_until && new Date(user.locked_until as string) > new Date()) {
    const minutes = Math.ceil((new Date(user.locked_until as string).getTime() - Date.now()) / 60_000);
    return { status: "error", message: `Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const valid = await verifyPassword(password, (user?.password_hash as string | undefined) ?? DUMMY_HASH);
  if (!user || !valid || !user.is_active) {
    if (user && user.is_active) {
      const failed = (user.failed_attempts as number) + 1;
      await db
        .from("admin_users")
        .update(failed >= MAX_FAILURES ? { failed_attempts: 0, locked_until: new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() } : { failed_attempts: failed })
        .eq("id", user.id);
    }
    return { status: "error", message: GENERIC };
  }

  await db.from("admin_users").update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq("id", user.id);
  await startSession(user.id as string, fingerprint(user.password_hash as string));
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/sign-in");
}

const passwordSchema = z.object({ current: z.string().min(1), next: z.string(), confirm: z.string() });

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let me;
  try {
    me = await assertAdmin();
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const parsed = passwordSchema.safeParse({ current: formData.get("current"), next: formData.get("next"), confirm: formData.get("confirm") });
  if (!parsed.success) return { status: "error", message: "Please fill in all the fields." };
  const { current, next, confirm } = parsed.data;

  const errors: Record<string, string> = {};
  const weak = passwordProblem(next);
  if (weak) errors.next = weak;
  if (next !== confirm) errors.confirm = "The two new passwords don't match.";
  if (next === current) errors.next = "Choose a password that is different from the current one.";
  if (Object.keys(errors).length) return { status: "error", errors };

  const db = serviceClient();
  const { data: row } = await db.from("admin_users").select("password_hash").eq("id", me.id).single();
  if (!row || !(await verifyPassword(current, row.password_hash as string))) return { status: "error", errors: { current: "That isn't your current password." } };

  const hash = await hashPassword(next);
  const { error } = await db.from("admin_users").update({ password_hash: hash, must_change_password: false }).eq("id", me.id);
  if (error) return { status: "error", message: "Could not save the new password. Please try again." };
  // Changing the hash signs out every other device; keep this one signed in.
  await startSession(me.id, fingerprint(hash));
  return { status: "success", message: "Password changed. Your other devices have been signed out." };
}

"use server";

import { z } from "zod";
import { assertManager } from "@/lib/admin/auth";
import { generatePassword, hashPassword, passwordProblem } from "@/lib/admin/password";
import { serviceClient } from "@/lib/supabase/server";

export type UserResult =
  | { ok: true; message: string; password?: string; email?: string }
  | { ok: false; error: string };

const fail = (error: string): UserResult => ({ ok: false, error });

async function guard() {
  try {
    return { me: await assertManager() };
  } catch (e) {
    return { error: fail((e as Error).message) };
  }
}

/** Number of other active admins besides `exceptId`. */
async function otherActiveAdmins(exceptId: string) {
  const { count } = await serviceClient()
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true)
    .neq("id", exceptId);
  return count ?? 0;
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
  role: z.enum(["admin", "editor"]),
  password: z.string().max(200).optional(),
});

export async function createUserAction(input: { name: string; email: string; role: string; password?: string }): Promise<UserResult> {
  const g = await guard();
  if (g.error) return g.error;
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const { name, email, role } = parsed.data;

  const typed = parsed.data.password?.trim();
  if (typed) {
    const weak = passwordProblem(typed);
    if (weak) return fail(weak);
  }
  const password = typed || generatePassword();

  const { error } = await serviceClient()
    .from("admin_users")
    .insert({ name, email, role, password_hash: await hashPassword(password), must_change_password: true });
  if (error) return fail(/duplicate|unique/i.test(error.message) ? "A user with that email already exists." : "Could not add the user. Please try again.");
  return { ok: true, message: `${name} was added as ${role === "admin" ? "an admin" : "an editor"}.`, password, email };
}

export async function updateUserAction(id: string, patch: { role?: string; is_active?: boolean; name?: string }): Promise<UserResult> {
  const g = await guard();
  if (g.error) return g.error;
  const db = serviceClient();
  const { data: target } = await db.from("admin_users").select("id, role, is_active, name").eq("id", id).maybeSingle();
  if (!target) return fail("That user no longer exists.");

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name || name.length > 80) return fail("Please enter a name (up to 80 characters).");
    update.name = name;
  }
  if (patch.role !== undefined) {
    if (patch.role !== "admin" && patch.role !== "editor") return fail("Unknown role.");
    update.role = patch.role;
  }
  if (patch.is_active !== undefined) update.is_active = patch.is_active;

  // Never leave the site without an active admin.
  const losesAdmin = target.role === "admin" && target.is_active && (update.role === "editor" || update.is_active === false);
  if (losesAdmin && (await otherActiveAdmins(id)) === 0) return fail("There must always be at least one active admin. Make someone else an admin first.");
  if (id === g.me!.id && (update.role === "editor" || update.is_active === false)) return fail("You can't remove your own admin access. Ask another admin to do it.");

  const { error } = await db.from("admin_users").update(update).eq("id", id);
  if (error) return fail("Could not save the change. Please try again.");
  return { ok: true, message: "Saved." };
}

export async function resetPasswordAction(id: string): Promise<UserResult> {
  const g = await guard();
  if (g.error) return g.error;
  const db = serviceClient();
  const { data: target } = await db.from("admin_users").select("email, name").eq("id", id).maybeSingle();
  if (!target) return fail("That user no longer exists.");
  const password = generatePassword();
  const { error } = await db
    .from("admin_users")
    .update({ password_hash: await hashPassword(password), must_change_password: true, failed_attempts: 0, locked_until: null })
    .eq("id", id);
  if (error) return fail("Could not reset the password. Please try again.");
  return { ok: true, message: `New temporary password for ${target.name || target.email}.`, password, email: target.email as string };
}

export async function deleteUserAction(id: string): Promise<UserResult> {
  const g = await guard();
  if (g.error) return g.error;
  if (id === g.me!.id) return fail("You can't delete your own account.");
  const db = serviceClient();
  const { data: target } = await db.from("admin_users").select("role, is_active").eq("id", id).maybeSingle();
  if (!target) return { ok: true, message: "Deleted." };
  if (target.role === "admin" && target.is_active && (await otherActiveAdmins(id)) === 0) return fail("There must always be at least one active admin.");
  const { error } = await db.from("admin_users").delete().eq("id", id);
  if (error) return fail("Could not delete the user. Please try again.");
  return { ok: true, message: "User deleted." };
}

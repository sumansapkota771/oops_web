import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasServiceRole, serviceClient } from "@/lib/supabase/server";
import { fingerprint } from "./password";
import { readSession, sessionConfigured } from "./session";

export type Role = "admin" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

type AdminStatus = { status: "signed-out" } | { status: "unconfigured"; reason: string } | { status: "ok"; user: AdminUser };

/** Everything the admin needs to run: the Supabase service key and a session secret. */
export function authProblem(): string | null {
  if (!hasServiceRole()) return "SUPABASE_SERVICE_ROLE_KEY is missing";
  if (!sessionConfigured()) return "ADMIN_SESSION_SECRET is missing (32+ characters)";
  return null;
}

/** The signed-in staff member, re-checked against the database on every request. */
export const getAdmin = cache(async (): Promise<AdminStatus> => {
  const problem = authProblem();
  if (problem) return { status: "unconfigured", reason: problem };
  const session = await readSession();
  if (!session) return { status: "signed-out" };
  const { data } = await serviceClient()
    .from("admin_users")
    .select("id, email, name, role, is_active, password_hash, must_change_password")
    .eq("id", session.uid)
    .maybeSingle();
  // Deactivated users, deleted users and sessions from before a password change are all signed out.
  if (!data || !data.is_active || fingerprint(data.password_hash as string) !== session.v) return { status: "signed-out" };
  return {
    status: "ok",
    user: { id: data.id, email: data.email, name: data.name || data.email, role: data.role as Role, mustChangePassword: Boolean(data.must_change_password) },
  };
});

/** For admin pages: redirects instead of rendering anything protected. */
export async function requireAdmin(): Promise<AdminUser> {
  const result = await getAdmin();
  if (result.status === "signed-out") redirect("/admin/sign-in");
  if (result.status === "unconfigured") redirect("/admin/setup");
  return result.user;
}

/** For pages only admins may open (user management). Editors are sent back to the dashboard. */
export async function requireManager(): Promise<AdminUser> {
  const user = await requireAdmin();
  if (user.role !== "admin") redirect("/admin");
  return user;
}

/** For server actions: throws so nothing is written. */
export async function assertAdmin(): Promise<AdminUser> {
  const result = await getAdmin();
  if (result.status !== "ok") throw new Error("Please sign in again to make changes.");
  return result.user;
}

/** For read-only server actions (e.g. browsing the media library). */
export const assertAdminRead = assertAdmin;

/** For server actions that manage users: admins only. */
export async function assertManager(): Promise<AdminUser> {
  const user = await assertAdmin();
  if (user.role !== "admin") throw new Error("Only admins can manage users.");
  return user;
}

import { UsersManager, type UserRow } from "@/components/admin/users-manager";
import { PageTitle } from "@/components/admin/ui";
import { requireManager } from "@/lib/admin/auth";
import { serviceClient } from "@/lib/supabase/server";

export const metadata = { title: "Users" };

export const instant = false;

export default async function UsersPage() {
  const me = await requireManager();
  const { data } = await serviceClient()
    .from("admin_users")
    .select("id, email, name, role, is_active, must_change_password, last_login_at")
    .order("created_at", { ascending: true });
  return (
    <>
      <PageTitle title="Users" subtitle="People who can sign in to this admin. Admins can add users and make others admins; editors can only edit the website." />
      <UsersManager users={(data ?? []) as UserRow[]} meId={me.id} />
    </>
  );
}

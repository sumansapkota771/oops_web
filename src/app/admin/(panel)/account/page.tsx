import { AccountForm } from "@/components/admin/account-form";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "My account" };

export const instant = false;

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <>
      <PageTitle title="My account" subtitle="Your sign-in details and password." />
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Card>
          <dl className="flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Name</dt>
              <dd className="mt-1 font-semibold">{me.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Email</dt>
              <dd className="mt-1 break-all font-semibold">{me.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Role</dt>
              <dd className="mt-1 font-semibold capitalize">{me.role}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-sea-300">Change password</h2>
          <AccountForm />
        </Card>
      </div>
    </>
  );
}

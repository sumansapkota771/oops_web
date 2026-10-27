"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createUserAction, deleteUserAction, resetPasswordAction, updateUserAction, type UserResult } from "@/app/admin/users-actions";
import { CopyIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { AButton, Card, inputClass, useToast } from "./ui";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
};

type Secret = { email: string; password: string; heading: string };

export function UsersManager({ users, meId }: { users: UserRow[]; meId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [secret, setSecret] = useState<Secret | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "editor", password: "" });

  const run = (fn: () => Promise<UserResult>, then?: (r: Extract<UserResult, { ok: true }>) => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error);
      then?.(res);
      if (!res.password) toast("ok", res.message);
      router.refresh();
    });

  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu" }) : "Never");

  return (
    <div className="flex flex-col gap-6">
      {secret ? (
        <div className="rounded-2xl bg-yellow/10 p-5 shadow-[inset_0_0_0_1px_rgb(255_195_0/0.35)]" role="status">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#ffe07a]">{secret.heading}</h2>
          <p className="mt-2 text-sm text-ink/90">
            Send these details to <strong>{secret.email}</strong> privately. The password is shown only once, and they’ll be asked to change it after signing in.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-space-950 px-4 py-2 text-lg font-bold tracking-wider">{secret.password}</code>
            <AButton onClick={() => navigator.clipboard.writeText(secret.password).then(() => toast("ok", "Password copied."))}>
              <CopyIcon size={14} aria-hidden /> Copy
            </AButton>
            <AButton variant="quiet" onClick={() => setSecret(null)}>
              Done
            </AButton>
          </div>
        </div>
      ) : null}

      <Card>
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-sea-300">Add a user</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => createUserAction(form),
              (r) => {
                if (r.password && r.email) setSecret({ email: r.email, password: r.password, heading: r.message });
                setForm({ name: "", email: "", role: "editor", password: "" });
              },
            );
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label htmlFor="u-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Name
            </label>
            <input id="u-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. Sita Sharma" />
          </div>
          <div>
            <label htmlFor="u-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Email
            </label>
            <input id="u-email" type="email" required spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="name@gmail.com" />
          </div>
          <div>
            <label htmlFor="u-role" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Role
            </label>
            <select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="editor">Editor — edits content, can’t manage users</option>
              <option value="admin">Admin — everything, including users</option>
            </select>
          </div>
          <div>
            <label htmlFor="u-pass" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Password <span className="font-normal normal-case tracking-normal text-subtle">(leave empty to generate one)</span>
            </label>
            <input id="u-pass" type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="10+ characters, letters and numbers" />
          </div>
          <div className="sm:col-span-2">
            <AButton type="submit" variant="primary" disabled={pending}>
              <PlusIcon size={14} aria-hidden /> Add user
            </AButton>
          </div>
        </form>
      </Card>

      <ul className="flex flex-col gap-3">
        {users.map((u) => {
          const me = u.id === meId;
          return (
            <li key={u.id}>
              <Card className={cn("flex flex-wrap items-center gap-x-6 gap-y-3 !p-4", !u.is_active && "opacity-60")}>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="flex flex-wrap items-center gap-2 font-bold">
                    {u.name || u.email}
                    {me ? <span className="rounded-full bg-sea-400/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sea-200">You</span> : null}
                    {!u.is_active ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Disabled</span> : null}
                    {u.must_change_password ? <span className="rounded-full bg-yellow/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#ffe07a]">Temporary password</span> : null}
                  </p>
                  <p className="break-all text-sm text-muted">{u.email}</p>
                  <p className="text-xs text-subtle">Last sign-in: {fmt(u.last_login_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`role-${u.id}`}>
                    Role for {u.email}
                  </label>
                  <select
                    id={`role-${u.id}`}
                    value={u.role}
                    disabled={pending || me}
                    onChange={(e) => run(() => updateUserAction(u.id, { role: e.target.value }))}
                    className={cn(inputClass, "w-32")}
                    title={me ? "You can't change your own role" : undefined}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <AButton
                    disabled={pending}
                    onClick={() => confirm(`Reset the password for ${u.email}? They will be signed out everywhere.`) && run(() => resetPasswordAction(u.id), (r) => r.password && r.email && setSecret({ email: r.email, password: r.password, heading: r.message }))}
                  >
                    Reset password
                  </AButton>
                  {!me ? (
                    <>
                      <AButton disabled={pending} onClick={() => run(() => updateUserAction(u.id, { is_active: !u.is_active }))}>
                        {u.is_active ? "Disable" : "Enable"}
                      </AButton>
                      <AButton variant="danger" className="px-3" aria-label={`Delete ${u.email}`} disabled={pending} onClick={() => confirm(`Delete ${u.email} permanently?`) && run(() => deleteUserAction(u.id))}>
                        <TrashIcon size={14} aria-hidden />
                      </AButton>
                    </>
                  ) : null}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

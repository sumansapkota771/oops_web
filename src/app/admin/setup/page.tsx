import Link from "next/link";
import { authProblem } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { hasServiceRole } from "@/lib/supabase/server";
import { sessionConfigured } from "@/lib/admin/session";

export const metadata = { title: "Setup" };

const Row = ({ ok, label, hint }: { ok: boolean; label: string; hint: string }) => (
  <li className="flex gap-4 rounded-2xl bg-space-850 p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]">
    <span className={`mt-1.5 size-3 shrink-0 rounded-full ${ok ? "bg-green" : "bg-yellow"}`} aria-hidden />
    <div>
      <p className="font-semibold">
        {label} <span className="text-xs font-normal text-subtle">{ok ? "· connected" : "· needs setup"}</span>
      </p>
      {!ok ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  </li>
);

export default function SetupPage() {
  const problem = authProblem();
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <h1 className="text-2xl font-extrabold uppercase">Admin setup</h1>
      <ul className="flex flex-col gap-3">
        <Row ok={isSupabaseConfigured && hasServiceRole()} label="Supabase (database + media/data buckets)" hint="Add NEXT_PUBLIC_SUPABASE_URL, the publishable key and SUPABASE_SERVICE_ROLE_KEY to .env.local, then run: pnpm db:setup && pnpm db:seed" />
        <Row ok={sessionConfigured()} label="Sign-in session secret" hint="Add ADMIN_SESSION_SECRET (a random string of 32+ characters) to .env.local." />
        <Row ok={!problem} label="First admin account" hint="Create it with: pnpm admin:create you@gmail.com" />
      </ul>
      <Link href="/admin/sign-in" className="text-sea-300 underline">
        Go to sign in
      </Link>
    </main>
  );
}

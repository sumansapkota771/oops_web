import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { authProblem, getAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Sign in" };

// Reads the session cookie, so this page is rendered per request.
export const instant = false;

export default async function SignInPage() {
  const status = await getAdmin();
  if (status.status === "ok") redirect("/admin");
  const problem = authProblem();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-space-950 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          OOPS! <span className="text-sea-300">Admin</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Sign in to edit the website</p>
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-space-850 p-6 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] sm:p-8">
        {problem ? (
          <p className="text-sm text-muted">
            Sign-in isn’t set up yet ({problem}). See{" "}
            <Link href="/admin/setup" className="text-sea-300 underline">
              setup
            </Link>
            .
          </p>
        ) : (
          <LoginForm />
        )}
      </div>
      <Link href="/" className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink">
        ← Back to website
      </Link>
    </main>
  );
}

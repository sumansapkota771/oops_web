import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · OOPS! Admin" },
  robots: { index: false, follow: false },
};

// Admin pages are per-user and never prerendered into the public shell.
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-space-950" aria-busy="true" />}>
      <ToastProvider>{children}</ToastProvider>
    </Suspense>
  );
}

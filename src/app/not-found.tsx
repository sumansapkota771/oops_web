import Link from "next/link";
import { Starfield } from "@/components/space/starfield";

export default function NotFound() {
  return (
    <>
      <Starfield />
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-sea-300 text-[clamp(6rem,22vw,14rem)] font-black leading-none">404</p>
        <h1 className="heading heading-md">Oops! Lost in space</h1>
        <p className="max-w-md text-muted">This page drifted out of orbit. Let’s get you back to the fun.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-sea-400 px-7 text-sm font-semibold uppercase tracking-wider text-space-950">
            Back to home
          </Link>
          <Link href="/attractions" className="inline-flex min-h-12 items-center rounded-full bg-white/10 px-7 text-sm font-semibold uppercase tracking-wider">
            See attractions
          </Link>
        </div>
      </main>
    </>
  );
}

import Link from "next/link";
import type { PowerplayTier } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/** Teaser card for the Powerplay recharge table. */
export function PowerplayCard({ tiers, title, subtitle, className }: { tiers: PowerplayTier[]; title: string; subtitle?: string; className?: string }) {
  const top = [...tiers].sort((a, b) => b.pay - a.pay)[0];
  const preview = tiers.slice(1, 5);
  return (
    <Link href="/prices-offers#powerplay" className={cn("group bezel block h-full", className)}>
      <div className="bezel-core relative flex h-full flex-col gap-5 overflow-hidden p-6 sm:p-7">
        <div>
          <h3 className="heading heading-sm">{title}</h3>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {top ? (
          <p className="rounded-2xl bg-white/[0.05] p-4 text-sm text-muted">
            Pay <strong className="text-ink">Rs. {formatNumber(top.pay)}</strong>, get{" "}
            <strong className="text-2xl font-extrabold text-yellow">{formatNumber(top.total)}</strong> credits
          </p>
        ) : null}
        <ul className="flex flex-col divide-y divide-white/[0.06] text-sm">
          {preview.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2.5">
              <span className="text-muted">Rs. {formatNumber(t.pay)}</span>
              <span className="font-semibold">
                {formatNumber(t.total)} <span className="text-xs font-normal text-[#9be05c]">+{formatNumber(t.bonus)} bonus</span>
              </span>
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sea-300">
          See the full table →
        </span>
      </div>
    </Link>
  );
}

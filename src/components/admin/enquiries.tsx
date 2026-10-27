"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteEnquiryAction, exportBackupAction, exportEnquiriesAction, setEnquiryStatusAction } from "@/app/admin/actions";
import type { Enquiry } from "@/lib/types";
import { EnvelopeSimpleIcon, PhoneIcon, TrashIcon } from "@/components/ui/icons";
import { cn, telHref } from "@/lib/utils";
import { AButton, Card, inputClass, useToast } from "./ui";

const STATUS: Array<{ value: Enquiry["status"]; label: string; cls: string }> = [
  { value: "new", label: "New", cls: "bg-yellow/20 text-[#ffe07a]" },
  { value: "contacted", label: "Contacted", cls: "bg-sea-400/20 text-sea-200" },
  { value: "closed", label: "Closed", cls: "bg-white/10 text-muted" },
];

export function Enquiries({ rows, canEdit }: { rows: Enquiry[]; canEdit: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [list, setList] = useState(rows);
  const [seenRows, setSeenRows] = useState(rows);
  // The server sends a fresh list after every refresh; show it instead of the copy we started with.
  if (rows !== seenRows) {
    setSeenRows(rows);
    setList(rows);
  }
  const [filter, setFilter] = useState<"all" | Enquiry["status"]>("all");
  const shown = list.filter((r) => filter === "all" || r.status === filter);

  // New enquiries arrive while the admin is open: re-check every 15 seconds and whenever the tab is focused again.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  const download = (fn: typeof exportEnquiriesAction) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error);
      toast("ok", res.message ?? "Exported.", res.url);
      if (res.url) window.open(res.url, "_blank");
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Status" className={cn(inputClass, "max-w-44")}>
          <option value="all">All ({list.length})</option>
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label} ({list.filter((r) => r.status === s.value).length})
            </option>
          ))}
        </select>
        <AButton className="ml-auto" onClick={() => router.refresh()}>
          Refresh
        </AButton>
        {canEdit ? (
          <AButton disabled={pending} onClick={() => download(exportEnquiriesAction)}>
            Export CSV
          </AButton>
        ) : null}
        {canEdit ? (
          <AButton disabled={pending} onClick={() => download(exportBackupAction)}>
            Backup all content
          </AButton>
        ) : null}
      </div>
      {shown.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-muted">No enquiries yet. Messages sent from the Book Now and Contact forms appear here.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-3 !p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-bold">{r.name}</h2>
                  <a href={telHref(r.phone)} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1 text-sm hover:bg-white/15">
                    <PhoneIcon size={14} aria-hidden /> {r.phone}
                  </a>
                  {r.email ? (
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 break-all rounded-full bg-white/[0.07] px-3 py-1 text-sm hover:bg-white/15">
                      <EnvelopeSimpleIcon size={14} aria-hidden /> {r.email}
                    </a>
                  ) : null}
                  <span className="text-xs text-subtle">
                    {new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu" })} · {r.source ?? "website"}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={r.status}
                      disabled={!canEdit || pending}
                      aria-label={`Status for ${r.name}`}
                      onChange={(e) => {
                        const status = e.target.value as Enquiry["status"];
                        setList((l) => l.map((x) => (x.id === r.id ? { ...x, status } : x)));
                        start(async () => {
                          const res = await setEnquiryStatusAction(r.id, status);
                          if (!res.ok) toast("error", res.error);
                          router.refresh();
                        });
                      }}
                      className={cn("rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider", STATUS.find((s) => s.value === r.status)?.cls)}
                    >
                      {STATUS.map((s) => (
                        <option key={s.value} value={s.value} className="bg-space-900 text-ink">
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {canEdit ? (
                      <AButton
                        variant="danger"
                        className="px-2"
                        aria-label={`Delete enquiry from ${r.name}`}
                        disabled={pending}
                        onClick={() => {
                          if (!confirm("Delete this enquiry?")) return;
                          start(async () => {
                            const res = await deleteEnquiryAction(r.id);
                            if (!res.ok) return toast("error", res.error);
                            setList((l) => l.filter((x) => x.id !== r.id));
                          });
                        }}
                      >
                        <TrashIcon size={14} aria-hidden />
                      </AButton>
                    ) : null}
                  </div>
                </div>
                {r.message ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{r.message}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

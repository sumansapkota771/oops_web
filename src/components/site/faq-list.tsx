import { PlusIcon } from "@/components/ui/icons";
import type { Faq } from "@/lib/types";

/** Accessible accordion built on native <details>/<summary>. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => (
        <details key={faq.id} className="group bezel" open={i === 0}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 rounded-[calc(2rem-0.375rem)] px-6 py-5 [&::-webkit-details-marker]:hidden">
            <h2 className="heading text-base sm:text-lg">{faq.question}</h2>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-500 ease-fluid group-open:rotate-45 group-open:bg-sea-400 group-open:text-space-950">
              <PlusIcon size={18} weight="bold" aria-hidden />
            </span>
          </summary>
          <p className="px-6 pb-6 text-base leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

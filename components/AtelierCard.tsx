import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { formatEUR } from "@/lib/money";
import { dayNumber, monthShort, toneForIndex } from "@/lib/ui";

export function AtelierCard({ s, index = 0 }: { s: Session; index?: number }) {
  const tone = toneForIndex(index);

  return (
    <Link
      href={`/ateliers/${s.id}`}
      className={`group flex items-center gap-4 rounded-card ${tone} p-3.5 shadow-soft transition active:scale-[.98]`}
    >
      <div className="date-badge h-14 w-14">
        <span className="font-display text-xl font-extrabold text-on-ink">{dayNumber(s.date_heure)}</span>
        <span className="text-[10px] font-bold uppercase text-on-ink/70">{monthShort(s.date_heure)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg leading-tight">{s.titre}</h3>
        <p className="mt-0.5 text-sm font-bold">{formatEUR(s.prix_cents)}</p>
      </div>
      <span className="arrow-fab bg-white text-ink group-hover:scale-105" aria-hidden>
        <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
      </span>
    </Link>
  );
}

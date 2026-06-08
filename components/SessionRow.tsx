import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { dayNumber, monthShort, toneForIndex } from "@/lib/ui";

export function SessionRow({ s, index = 0 }: { s: Session; index?: number }) {
  const restantes = placesRestantes(s);
  const tone = toneForIndex(index);

  return (
    <Link
      href={`/ateliers/${s.id}`}
      className={`group flex items-center gap-4 rounded-card ${tone} p-4 shadow-soft transition active:scale-[.98]`}
    >
      <div className="date-badge">
        <span className="font-display text-lg font-extrabold text-ink">
          {dayNumber(s.date_heure)}
        </span>
        <span className="text-[10px] font-bold uppercase text-muted">
          {monthShort(s.date_heure)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="eyebrow truncate opacity-70">{s.lieu}</p>
        <h3 className="mt-0.5 truncate font-display text-lg leading-tight">
          {s.titre}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-sm font-bold">
          <span className="opacity-80">
            {restantes > 0
              ? `${restantes} place${restantes > 1 ? "s" : ""}`
              : "Complet"}
          </span>
          <span className="opacity-40">•</span>
          <span>{formatEUR(s.prix_cents)}</span>
        </div>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        strokeWidth={1.8}
      />
    </Link>
  );
}

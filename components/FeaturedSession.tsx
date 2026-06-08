import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { dayNumber, monthShort } from "@/lib/ui";

export function FeaturedSession({ s }: { s: Session }) {
  const complet = placesRestantes(s) <= 0;

  return (
    <div className="relative rounded-card tone-brand p-6 shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-white/70">Prochain atelier</p>
        <div className="date-badge h-14 w-14">
          <span className="font-display text-xl font-extrabold text-on-ink">
            {dayNumber(s.date_heure)}
          </span>
          <span className="text-[10px] font-bold uppercase text-on-ink/70">
            {monthShort(s.date_heure)}
          </span>
        </div>
      </div>

      <h2 className="mt-3 font-display text-[30px] leading-[1.08] text-white">
        {s.titre}
      </h2>
      <p className="mt-2 text-white/85">
        {s.capacite} place{s.capacite > 1 ? "s" : ""}
      </p>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-extrabold text-white">
            {formatEUR(s.prix_cents)}
          </p>
          <p className="text-sm text-white/85">par place</p>
        </div>

        <Link
          href={`/ateliers/${s.id}`}
          className="group inline-flex items-center gap-3"
          aria-label={complet ? `Voir l'atelier ${s.titre}` : `Réserver ${s.titre}`}
        >
          <span className="font-bold text-white">
            {complet ? "Voir" : "Réserver"}
          </span>
          <span className="arrow-fab bg-white text-ink group-hover:scale-105">
            <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";
import { formatDateLong, dayNumber, monthShort } from "@/lib/ui";
import { Floaty } from "@/components/motion";

export function FeaturedSession({ s }: { s: Session }) {
  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <div className="relative overflow-hidden rounded-card tone-brand p-6 shadow-lift">
      {/* Décor flottant (blobs) */}
      <Floaty className="blob -right-12 -top-14 h-48 w-48 bg-white/25" />
      <Floaty className="blob -bottom-16 -left-12 h-44 w-44 bg-magenta/30" />
      <Floaty className="blob right-10 bottom-0 h-24 w-24 bg-lime/40" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-white/70">Prochain atelier</p>
            <h2 className="mt-1.5 font-display text-[28px] leading-[1.1] text-white">
              {s.titre}
            </h2>
          </div>
          <div className="date-badge">
            <span className="font-display text-lg font-extrabold text-ink">
              {dayNumber(s.date_heure)}
            </span>
            <span className="text-[10px] font-bold uppercase text-muted">
              {monthShort(s.date_heure)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-white/90">
          <p className="meta-row">
            <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span className="capitalize">{formatDateLong(s.date_heure)}</span>
          </p>
          <p className="meta-row">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {s.lieu}
          </p>
          <p className="meta-row">
            <Users className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {complet
              ? "Complet"
              : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-extrabold text-white">
              {formatEUR(s.prix_cents)}
            </p>
            <p className="text-sm text-white/70">par place</p>
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
    </div>
  );
}

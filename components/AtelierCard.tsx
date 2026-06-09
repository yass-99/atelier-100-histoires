"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, Clock, MapPin, Hourglass } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes, publicCibleLabel } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { CompleteSignal } from "./CompleteSignal";
import {
  dayNumber,
  monthShort,
  stubToneForIndex,
  formatDuree,
  formatDateShort,
  formatHeure,
  capitalizeFirst,
} from "@/lib/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={2} aria-hidden />
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</dt>
        <dd className="font-display text-sm font-extrabold">{value}</dd>
      </div>
    </div>
  );
}

export function AtelierCard({ s, index = 0 }: { s: Session; index?: number }) {
  const [open, setOpen] = useState(false);
  const stub = stubToneForIndex(index);
  const restantes = placesRestantes(s);
  const complet = restantes <= 0;
  const heure = formatHeure(s.date_heure);

  return (
    <div className="relative flex overflow-hidden rounded-card border-[1.5px] border-ink bg-surface shadow-soft">
      {/* Talon date — pleine hauteur */}
      <div className={`flex w-16 shrink-0 flex-col items-center justify-center ${stub}`}>
        <span className="font-display text-2xl font-black leading-none">
          {dayNumber(s.date_heure)}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          {monthShort(s.date_heure)}
        </span>
      </div>

      {/* Colonne contenu */}
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="relative flex w-full items-center gap-3 p-3.5 text-left transition active:opacity-80"
        >
          <div className={`min-w-0 flex-1 ${complet ? "opacity-50" : ""}`}>
            <h3 className="truncate font-display text-lg leading-tight">{s.titre}</h3>
            <p className="mt-1 text-sm">
              <span className="font-bold">{formatEUR(s.prix_cents)}</span>
              {!complet && (
                <span className="text-muted"> · {restantes} place{restantes > 1 ? "s" : ""}</span>
              )}
            </p>
          </div>

          {/* Tampon COMPLET (effet cachet) */}
          <CompleteSignal complete={complet} className="absolute right-14 top-1/2 -translate-y-1/2" />


          <motion.span
            className="arrow-fab bg-ink text-on-ink"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            aria-hidden
          >
            <ChevronDown className="h-5 w-5" strokeWidth={2} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.section
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="space-y-4 px-4 pb-4 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  <span className="chip bg-background text-ink">
                    {publicCibleLabel(s.public_cible, s.age_minimum)}
                  </span>
                  {s.conso_incluse && (
                    <span className="chip bg-amber-soft text-ink">Conso incluse</span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  <Info icon={CalendarDays} label="Date" value={capitalizeFirst(formatDateShort(s.date_heure))} />
                  <Info icon={Clock} label="Heure" value={heure} />
                  <Info icon={MapPin} label="Lieu" value={s.lieu} />
                  <Info icon={Hourglass} label="Durée" value={formatDuree(s.duree)} />
                </dl>

                {s.description && (
                  <p className="line-clamp-3 text-sm text-muted">{s.description}</p>
                )}

                {complet ? (
                  <Link href={`/ateliers/${s.id}`} className="btn-outline w-full">
                    En savoir plus
                  </Link>
                ) : (
                  <Link href={`/ateliers/${s.id}`} className="btn-primary w-full">
                    Je suis intéressé
                  </Link>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Perforation verticale + encoches (enfants directs de la carte) */}
      <span
        className="pointer-events-none absolute bottom-3 left-16 top-3 -translate-x-1/2 border-l-2 border-dashed border-ink/30"
        aria-hidden
      />
      <span className="perf-notch left-16 -top-2.5" aria-hidden />
      <span className="perf-notch left-16 -bottom-2.5" aria-hidden />
    </div>
  );
}

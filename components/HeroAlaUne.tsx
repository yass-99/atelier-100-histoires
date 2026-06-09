"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes, publicCibleLabel } from "@/lib/sessions.shared";
import {
  dayNumber,
  monthShort,
  capitalizeFirst,
  formatDateShort,
  formatHeure,
} from "@/lib/ui";

/**
 * Hero « À la une » : carrousel plein-cadre des ateliers mis en avant
 * (photo + voile + infos + CTA). Swipe horizontal + points. Chaque slide
 * mène à la page de l'atelier. Le parent garantit `sessions.length > 0`.
 */
export function HeroAlaUne({ sessions }: { sessions: Session[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <section aria-label="Ateliers à la une">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sessions.map((s, i) => {
          const photo = s.image_urls?.[0] ?? s.image_url ?? null;
          const restantes = placesRestantes(s);
          const complet = restantes <= 0;

          return (
            <Link
              key={s.id}
              href={`/ateliers/${s.id}`}
              className="relative block h-72 w-full shrink-0 snap-center overflow-hidden rounded-card border-[1.5px] border-ink shadow-soft"
            >
              {/* Fond : photo de couverture ou aplat de marque */}
              {photo ? (
                <Image
                  src={photo}
                  alt={s.titre}
                  fill
                  sizes="(max-width: 448px) 100vw, 448px"
                  className="object-cover"
                  priority={i === 0}
                />
              ) : (
                <div className="absolute inset-0 tone-brand" />
              )}

              {/* Voile sombre bas → texte blanc lisible (≥ 4.5:1) */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

              {/* Badge date (haut gauche) */}
              <span className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-surface px-3 py-1.5 leading-none text-ink shadow-soft">
                <span className="font-display text-xl font-black">{dayNumber(s.date_heure)}</span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                  {monthShort(s.date_heure)}
                </span>
              </span>

              {/* Pastille « À la une » (haut droite) */}
              <span className="chip absolute right-4 top-4 bg-amber text-ink">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                À la une
              </span>

              {/* Contenu (bas) */}
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h2 className="font-display text-[26px] leading-[1.05] drop-shadow-sm">
                  {s.titre}
                </h2>
                <p className="mt-1.5 text-sm font-semibold text-white/90">
                  {capitalizeFirst(formatDateShort(s.date_heure))} · {formatHeure(s.date_heure)}
                  {!complet && (
                    <> · {restantes} place{restantes > 1 ? "s" : ""}</>
                  )}
                </p>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <span className="chip bg-surface/90 text-ink">
                    {publicCibleLabel(s.public_cible, s.age_minimum)}
                  </span>
                  {s.conso_incluse && (
                    <span className="chip bg-surface/90 text-ink">Conso incluse</span>
                  )}
                </span>
                <span className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-full bg-surface px-5 font-display text-sm font-extrabold text-ink">
                  {complet ? "Voir l'atelier" : "Je réserve"}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Points de progression */}
      {sessions.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {sessions.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/30"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";
import { useRef, useState, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes, publicCibleLabel } from "@/lib/sessions.shared";
import {
  dayNumber,
  monthShort,
  capitalizeFirst,
  formatDateShort,
  formatHeure,
} from "@/lib/ui";
import { heroIntro, heroOutro, type HeroMessage } from "@/lib/hero-slides";

/**
 * Hero « À la une » : carrousel plein-cadre qui mêle des slides « message »
 * (positionnement, désir d'expérience, rareté) et des slides « atelier » mis en
 * avant. Une slide message ouvre et ferme toujours le carrousel → la zone n'est
 * jamais vide, même sans atelier à la une. Swipe horizontal + points.
 */
type Item =
  | { kind: "message"; key: string; message: HeroMessage }
  | { kind: "atelier"; key: string; session: Session };

export function HeroAlaUne({ sessions }: { sessions: Session[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const items: Item[] = [
    { kind: "message", key: heroIntro.id, message: heroIntro },
    ...sessions.map((s) => ({ kind: "atelier" as const, key: s.id, session: s })),
    { kind: "message", key: heroOutro.id, message: heroOutro },
  ];
  const firstAtelierId = sessions[0]?.id;

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  // Défilement programmé vers une slide (points + flèches). Indispensable au
  // desktop souris où le scroll-snap horizontal n'a aucune affordance.
  function scrollToIndex(i: number) {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    const left = el.scrollLeft + child.getBoundingClientRect().left - el.getBoundingClientRect().left;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }

  const multi = items.length > 1;

  return (
    <section aria-label="À la une">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) =>
          it.kind === "atelier" ? (
            <AtelierSlide
              key={it.key}
              s={it.session}
              priority={it.key === firstAtelierId}
            />
          ) : (
            <MessageSlide key={it.key} m={it.message} />
          ),
        )}
      </div>

      {/* Contrôles : flèches + points réunis sous le carrousel (aucun
          chevauchement du contenu des slides). */}
      {multi && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Slide précédente"
            className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink/15 bg-surface text-ink transition active:scale-90 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>

          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Aller à la slide ${i + 1}`}
                aria-current={i === active}
                className="flex h-11 items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/30"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(items.length - 1, active + 1))}
            disabled={active === items.length - 1}
            aria-label="Slide suivante"
            className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink/15 bg-surface text-ink transition active:scale-90 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      )}
    </section>
  );
}

/** Slide « message » : aplat de marque + accroche + CTA vers la liste. */
function MessageSlide({ m }: { m: HeroMessage }) {
  return (
    <a
      href={m.ctaHref}
      onClick={() => track("hero_message_clic", { id: m.id })}
      className={`relative flex h-72 w-full shrink-0 snap-center flex-col justify-center overflow-hidden rounded-card border-[1.5px] border-ink p-6 shadow-soft transition active:opacity-90 ${m.tone}`}
    >
      <span className="eyebrow inline-flex items-center gap-1.5 opacity-90">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
        {m.eyebrow}
      </span>
      <h2 className="mt-2.5 max-w-[15rem] font-display text-[28px] leading-[1.05]">{m.titre}</h2>
      <p className="mt-2 max-w-[18rem] text-sm font-semibold opacity-90">{m.texte}</p>
      <span className="mt-4 inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-surface px-5 font-display text-sm font-extrabold text-ink">
        {m.ctaLabel}
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
      </span>
    </a>
  );
}

/** Slide « atelier » mis en avant : photo de couverture + infos + CTA. */
function AtelierSlide({ s, priority }: { s: Session; priority: boolean }) {
  const photo = s.image_urls?.[0] ?? s.image_url ?? null;
  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <Link
      href={`/ateliers/${s.id}`}
      transitionTypes={["nav-forward"]}
      onClick={() => track("atelier_clic", { id: s.id, source: "hero" })}
      className="relative block h-72 w-full shrink-0 snap-center overflow-hidden rounded-card border-[1.5px] border-ink shadow-soft"
    >
      {/* Fond : photo de couverture ou aplat de marque. Nommé pour le morph
          vers la fiche (View Transitions API). */}
      <ViewTransition name={`atelier-photo-${s.id}`} share="morph">
        {photo ? (
          <Image
            src={photo}
            alt={s.titre}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
            priority={priority}
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 tone-brand" />
        )}
      </ViewTransition>

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
        <h2 className="font-display text-[26px] leading-[1.05] drop-shadow-sm">{s.titre}</h2>
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
}

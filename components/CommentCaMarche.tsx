"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { SPRING_SNAPPY, SPRING_SOFT, staggerContainer, staggerItem } from "@/lib/motion";
import { AVIS } from "@/lib/avis";

/**
 * « Comment ça marche » — frise verticale scroll-guidée.
 *
 * Section éditoriale sobre (pas de grosse carte enveloppante) qui suit le rythme
 * de la page : 4 étapes du parcours, chacune levant une objection d'achat.
 * La ligne verticale se REMPLIT selon la progression de scroll dans la section
 * (micro-engagement visible), les étapes apparaissent en cascade (Stagger).
 * Se termine par une preuve sociale (démo) + un CTA contextuel au pic de motivation.
 * Aplats de couleur unis (aucun dégradé), numéros colorés, aucune emoji.
 */

const STEPS = [
  {
    title: "Choisis ton atelier",
    desc: "Parcours l'agenda : tous les âges, débutant·e·s bienvenu·e·s.",
    tone: "bg-brand text-white",
  },
  {
    title: "Réserve en 2 minutes",
    desc: "Paiement 100 % sécurisé, annulation gratuite jusqu'à 48 h.",
    tone: "bg-magenta text-white",
  },
  {
    title: "Viens, tout est prêt",
    desc: "Matériel fourni, lieu chaleureux, conso souvent incluse.",
    tone: "bg-amber text-ink",
  },
  {
    title: "Repars avec ta création",
    desc: "Guidé·e pas à pas, tu repars fier·e — prêt·e à la montrer.",
    tone: "bg-mint text-white",
  },
] as const;

/**
 * Note 5 étoiles « tape-à-l'œil » : les étoiles apparaissent en cascade (pop
 * ressort) à l'entrée à l'écran, et rebondissent au tap. Respecte reduced-motion.
 */
function StarRating({ rating }: { rating: number }) {
  const reduce = useReducedMotion();
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Noté ${rating} étoiles sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className={`cursor-pointer select-none ${i < rating ? "text-amber" : "text-ink/20"}`}
          initial={reduce ? false : { scale: 0, rotate: -45, opacity: 0 }}
          whileInView={
            reduce
              ? undefined
              : { scale: 1, rotate: 0, opacity: 1, transition: { ...SPRING_SOFT, delay: i * 0.08 } }
          }
          viewport={{ once: true, margin: "-30px" }}
          whileTap={{ scale: 1.35, rotate: 12, transition: SPRING_SNAPPY }}
        >
          <Star className="h-5 w-5 fill-current" strokeWidth={1.5} aria-hidden />
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Carrousel d'avis (démo) : cartes en défilement horizontal avec accroche
 * (scroll-snap), points de navigation cliquables. Swipe au doigt sur mobile.
 */
function AvisCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  // Aperçu sur l'accueil : 3 avis. La page /avis affiche toute la liste.
  const avis = AVIS.slice(0, 3);

  // Étape active = carte dont le centre est le plus proche du centre du viewport
  // du carrousel (robuste quel que soit l'alignement de snap).
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const node = child as HTMLElement;
      const cardCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  };

  const goTo = (i: number) => {
    const card = trackRef.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="mt-7">
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {avis.map((a) => (
          <li key={a.name} className="flex w-full shrink-0 snap-center">
            <figure className="card flex w-full flex-col">
              <StarRating rating={a.rating} />
              <blockquote className="mt-2.5 grow font-display text-base font-bold leading-snug text-foreground">
                « {a.quote} »
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${a.avatarTone}`}
                >
                  {a.initial}
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold text-foreground">{a.name}</span>
                  <span className="block text-muted">{a.meta}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* Points de navigation — cliquables, cible tactile ≥ 44px (zone padée). */}
      <div className="mt-3 flex justify-center gap-1">
        {avis.map((a, i) => (
          <button
            key={a.name}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Voir l'avis ${i + 1} sur ${avis.length}`}
            aria-current={i === active}
            className="flex h-11 w-7 items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                i === active ? "w-5 bg-ink" : "w-2 bg-ink/25"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommentCaMarche() {
  const reduce = useReducedMotion();
  const timelineRef = useRef<HTMLOListElement>(null);
  const firstNodeRef = useRef<HTMLSpanElement>(null);
  const lastNodeRef = useRef<HTMLSpanElement>(null);
  // Bornes du rail : mesurées sur le centre du premier et du dernier nœud, pour
  // que la ligne s'arrête pile sur le nœud final (le texte d'une étape peut être
  // plus haut que le nœud → des bornes en % déborderaient).
  const [rail, setRail] = useState<{ top: number; height: number } | null>(null);

  // La progression suit le passage de la frise dans la fenêtre : la ligne se
  // remplit du premier au dernier nœud à mesure qu'on scrolle.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const ol = timelineRef.current;
    const first = firstNodeRef.current;
    const last = lastNodeRef.current;
    if (!ol || !first || !last) return;
    const measure = () => {
      const o = ol.getBoundingClientRect();
      const f = first.getBoundingClientRect();
      const l = last.getBoundingClientRect();
      const top = f.top - o.top + f.height / 2;
      const bottom = l.top - o.top + l.height / 2;
      setRail({ top, height: Math.max(0, bottom - top) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, []);

  return (
    <section aria-label="Comment ça marche">
      <p className="eyebrow text-muted">Comment ça marche</p>
      <h2 className="mt-1 font-display text-2xl">De l&apos;envie à ta création</h2>
      <p className="mt-2 text-muted">Quatre étapes, zéro prise de tête.</p>

      <motion.ol
        ref={timelineRef}
        className="relative mt-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* Rail : track discret + remplissage qui scale selon le scroll.
            Bornes mesurées sur le centre du premier et du dernier nœud. */}
        <span
          aria-hidden
          style={{ top: rail?.top ?? 18, height: rail?.height ?? 0 }}
          className="pointer-events-none absolute left-[18px] w-[2px] -translate-x-1/2 rounded-full bg-ink/12"
        />
        <motion.span
          aria-hidden
          style={{ top: rail?.top ?? 18, height: rail?.height ?? 0, scaleY: reduce ? 1 : fillScale }}
          className="pointer-events-none absolute left-[18px] w-[2px] -translate-x-1/2 origin-top rounded-full bg-ink"
        />

        {STEPS.map(({ title, desc, tone }, i) => (
          <motion.li
            key={title}
            variants={staggerItem}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            {/* Nœud numéroté : aplat de couleur, contour navy, anneau crème
                pour « percer » proprement le rail (le rail passe dessous). */}
            <span
              ref={i === 0 ? firstNodeRef : i === STEPS.length - 1 ? lastNodeRef : undefined}
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink font-display text-base font-extrabold ring-4 ring-background ${tone}`}
            >
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="font-display text-lg font-extrabold leading-tight text-foreground">
                {title}
              </h3>
              <p className="mt-0.5 text-sm text-muted">{desc}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>

      {/* Preuve sociale — CONTENU DE DÉMO à remplacer par de vrais avis.
          Pas de badge « vérifié » : ne pas afficher un avis non authentifié
          comme vérifié (trompeur + risque légal). */}
      <AvisCarousel />

      <Link
        href="/avis"
        onClick={() => track("comment_ca_marche_avis_cta")}
        className="btn-amber mt-5 w-full"
      >
        Voir ce que les gens en pensent
        <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  );
}

"use client";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Star, Quote, Camera, ArrowRight } from "lucide-react";
import { AVIS, AVIS_AGGREGAT } from "@/lib/avis";
import { SPRING_SOFT, T_BASE, T_SLOW, staggerContainer, staggerItem } from "@/lib/motion";
import { Counter } from "@/components/Counter";
import LogoLoop from "@/components/LogoLoop";

/** Chiffres clés (DÉMO) — tuiles colorées, nombre animé en compteur. */
const STATS = [
  { value: 1200, suffix: "+", label: "créations reparties", bg: "bg-brand-soft" },
  { value: 2500, suffix: "+", label: "participant·e·s", bg: "bg-magenta-soft" },
  { value: 98, suffix: " %", label: "nous recommandent", bg: "bg-mint-soft" },
];

/** Accents tournants pour les guillemets des cartes blanches. */
const QUOTE_TONES = ["text-brand", "text-amber", "text-mint", "text-magenta", "text-brand"];

/** Tuiles galerie (placeholder) — aplats vifs, défilent en carrousel. */
const GALLERY = [
  { bg: "bg-brand", fg: "text-white" },
  { bg: "bg-amber", fg: "text-ink" },
  { bg: "bg-magenta", fg: "text-white" },
  { bg: "bg-mint", fg: "text-white" },
  { bg: "bg-lavender", fg: "text-ink" },
  { bg: "bg-brand", fg: "text-white" },
  { bg: "bg-magenta", fg: "text-white" },
  { bg: "bg-amber", fg: "text-ink" },
];

const galleryLogos = GALLERY.map((g, i) => ({
  ariaLabel: `Création ${i + 1}`,
  node: (
    <div
      className={`flex h-44 w-36 items-center justify-center rounded-2xl border-[1.5px] border-ink ${g.bg} ${g.fg}`}
    >
      <Camera className="h-8 w-8" strokeWidth={1.6} aria-hidden />
    </div>
  ),
}));

/** Mot du titre : montée douce, façon ressort. */
const wordUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_SOFT },
};
const wordsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

/** Étoiles qui « poppent » une à une (ressort). Amber, lisible sur tous fonds. */
function StarsPop({ n, label }: { n: number; label?: string }) {
  return (
    <div
      className="flex items-center gap-0.5 text-amber"
      role="img"
      aria-label={label ?? `Noté ${n} étoiles sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className={i < n ? "" : "text-ink/20"}
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ ...SPRING_SOFT, delay: i * 0.07 }}
        >
          <Star className={`h-5 w-5 ${i < n ? "fill-current" : "fill-none"}`} strokeWidth={1.5} aria-hidden />
        </motion.span>
      ))}
    </div>
  );
}

export function AvisView() {
  const featured = AVIS[0];
  const rest = AVIS.slice(1);

  return (
    <main className="screen space-y-9 py-8">
      {/* En-tête — éléments révélés un à un ; titre mot par mot. */}
      <div>
        <motion.p
          className="eyebrow text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={T_BASE}
        >
          Vos avis
        </motion.p>
        <motion.h1
          className="mt-1.5 font-display text-[34px] leading-[1.05]"
          variants={wordsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {["Ce", "que", "vous", "en"].map((w, i) => (
            <motion.span key={i} variants={wordUp} className="mr-[0.26em] inline-block">
              {w}
            </motion.span>
          ))}
          <motion.span variants={wordUp} className="mark inline-block bg-magenta text-white">
            pensez
          </motion.span>
        </motion.h1>
        <motion.p
          className="mt-3 text-muted"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...T_BASE, delay: 0.45 }}
        >
          Des débutant·e·s qui repartent fier·e·s de leur création. Voici, sans filtre, ce que
          vivent nos participant·e·s.
        </motion.p>
      </div>

      {/* Note agrégée — aplat bleu, gros compteur + étoiles en cascade. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={T_SLOW}
        className="flex items-center gap-5 rounded-card border-[1.5px] border-ink bg-brand p-6 text-white shadow-card"
      >
        <div className="shrink-0 text-center leading-none">
          <Counter
            value={AVIS_AGGREGAT.note}
            decimals={1}
            className="block font-display text-[64px] font-extrabold"
          />
          <div className="text-xs font-bold uppercase tracking-wide text-white/70">sur 5</div>
        </div>
        <div className="min-w-0">
          <StarsPop n={5} />
          <p className="mt-2 text-sm">
            <Counter value={AVIS_AGGREGAT.total} suffix=" avis" className="font-bold" />
          </p>
          <p className="text-sm text-white/80">100 % repartent avec leur création</p>
        </div>
      </motion.div>

      {/* Galerie créations — carrousel horizontal auto-défilant (photos plus
          grandes). Placeholder vif, à remplacer par de vraies photos. */}
      <section aria-label="Leurs créations">
        <p className="eyebrow text-muted">En vrai</p>
        <h2 className="mt-1 font-display text-2xl">Ce qu&apos;ils sont repartis avec</h2>
        <div className="mt-3 -mx-4">
          <LogoLoop
            logos={galleryLogos}
            speed={40}
            direction="left"
            gap={12}
            logoHeight={176}
            ariaLabel="Créations des participant·e·s"
          />
        </div>
        <p className="mt-2 px-0 text-xs text-muted">
          Démo — à remplacer par de vraies photos de créations (souvent le format le plus convaincant).
        </p>
      </section>

      {/* Chiffres clés — tuiles colorées (plus de noir), compteurs animés. */}
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-3 gap-2.5"
        aria-label="Nos chiffres"
      >
        {STATS.map((s) => (
          <motion.li
            key={s.label}
            variants={staggerItem}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-ink/12 ${s.bg} px-2 py-4 text-center`}
          >
            <Counter
              value={s.value}
              suffix={s.suffix}
              className="font-display text-2xl font-extrabold text-foreground"
            />
            <span className="text-[11px] font-bold leading-tight text-foreground/65">{s.label}</span>
          </motion.li>
        ))}
      </motion.ul>

      {/* Témoignages : un vedette en aplat corail, puis cartes en cascade. */}
      <section className="space-y-3" aria-label="Témoignages">
        <div>
          <p className="eyebrow text-muted">Ils l&apos;ont vécu</p>
          <h2 className="mt-1 font-display text-2xl">Leurs mots, pas les nôtres</h2>
        </div>

        {/* Vedette — aplat corail, citation en grand. */}
        <motion.figure
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={T_SLOW}
          className="rounded-card border-[1.5px] border-ink bg-magenta p-6 text-white shadow-card"
        >
          <StarsPop n={featured.rating} />
          <blockquote className="mt-3 font-display text-xl font-extrabold leading-snug">
            « {featured.quote} »
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold text-magenta"
            >
              {featured.initial}
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-bold">{featured.name}</span>
              <span className="block text-white/80">{featured.meta}</span>
            </span>
          </figcaption>
        </motion.figure>

        {/* Les autres — cartes blanches, guillemet coloré tournant, en cascade. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="space-y-3"
        >
          {rest.map((a, i) => (
            <motion.figure key={a.name} variants={staggerItem} className="card">
              <div className="flex items-start justify-between gap-3">
                <StarsPop n={a.rating} />
                <Quote
                  className={`h-7 w-7 shrink-0 ${QUOTE_TONES[i % QUOTE_TONES.length]}`}
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <blockquote className="mt-2.5 font-display text-base font-bold leading-snug text-foreground">
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
            </motion.figure>
          ))}
        </motion.div>
      </section>

      {/* CTA — aplat bleu + bouton clair (pas de bouton noir). */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={T_SLOW}
        className="rounded-card border-[1.5px] border-ink bg-brand p-6 text-center text-white shadow-card"
      >
        <h2 className="font-display text-xl font-extrabold">Prêt·e à créer la vôtre&nbsp;?</h2>
        <p className="mt-1.5 text-sm text-white/90">
          Choisis ton atelier et repars avec ta création.
        </p>
        <Link
          href="/ateliers"
          className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface px-5 py-3 font-bold text-ink transition active:scale-[.97]"
        >
          Voir les ateliers
          <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
        </Link>
      </motion.div>
    </main>
  );
}

"use client";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

/**
 * La promesse — bande éditoriale animée : le texte apparaît en fondu fluide
 * et les mots-clés surlignés (.mark) se « tracent » au marqueur (wipe
 * gauche→droite via clip-path) en même temps. Déclenché à l'entrée à l'écran.
 * Respecte « réduire les animations ».
 */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const eyebrowV = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};
const sentence = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE, delayChildren: 0.1, staggerChildren: 0.08 },
  },
};
const wipe = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  show: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.55, ease: EASE } },
};

/** Surligneur : le fond + le texte se révèlent ensemble par un balayage. */
function Mark({
  className,
  reduce,
  children,
}: {
  className: string;
  reduce: boolean;
  children: ReactNode;
}) {
  if (reduce) return <span className={`mark ${className}`}>{children}</span>;
  return (
    <motion.span variants={wipe} className={`mark inline-block ${className}`}>
      {children}
    </motion.span>
  );
}

export function Promesse() {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.section
      aria-label="La promesse"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.p variants={eyebrowV} className="eyebrow text-muted">
        La promesse
      </motion.p>
      <motion.p
        variants={sentence}
        className="mt-3 font-display text-[26px] font-extrabold leading-[1.6] tracking-tight text-foreground"
      >
        Tu repars avec{" "}
        <Mark className="bg-amber text-ink" reduce={reduce}>
          ton bijou
        </Mark>
        . Pour{" "}
        <Mark className="bg-magenta text-white" reduce={reduce}>
          petits et grands
        </Mark>
        . Dans un lieu chaleureux,{" "}
        <Mark className="bg-brand text-white" reduce={reduce}>
          conso souvent incluse
        </Mark>
        .
      </motion.p>
    </motion.section>
  );
}

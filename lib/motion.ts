import type { Transition, Variants } from "framer-motion";

/**
 * Tokens de mouvement — source unique de vérité pour TOUTES les animations
 * Framer du site. Module de constantes pures : aucune directive "use client",
 * importable côté serveur comme côté client.
 *
 * Règle : ne jamais redéfinir une courbe, une durée ou un spring en local.
 * On importe ces tokens (cf. design-system/MASTER.md § Motion).
 */

/** Courbe « douce » maison (ease-out façon Framer). */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Durées standard, en secondes. */
export const DURATION = {
  fast: 0.2, // micro-interactions, sorties
  base: 0.32, // transitions courantes (expand, fondu)
  slow: 0.5, // apparitions, révélations
} as const;

/** Spring réactif : feedback UI direct (press, indicateurs, compteurs). */
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 320, damping: 24 };
/** Spring souple : apparitions et révélations qui « se posent ». */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 260, damping: 20 };

/** Presets de transition tween prêts à l'emploi. */
export const T_FAST: Transition = { duration: DURATION.fast, ease: EASE };
export const T_BASE: Transition = { duration: DURATION.base, ease: EASE };
export const T_SLOW: Transition = { duration: DURATION.slow, ease: EASE };

/** Apparition fondu + glissé vers le haut (le motif `Reveal`). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: T_SLOW },
};

/** Conteneur qui fait apparaître ses enfants l'un après l'autre. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Un élément d'une cascade `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

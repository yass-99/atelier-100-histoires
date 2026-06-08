"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/* Courbe "douce" partagée (ease-out façon Framer). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Fournisseur global : respecte le réglage "réduire les animations". */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* Apparition en fondu + glissé vers le haut, déclenchée à l'entrée à l'écran. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* Conteneur qui fait apparaître ses enfants l'un après l'autre. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

/* Un élément d'une liste "Stagger". */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/* Carte/élément qui "rebondit" légèrement à l'apparition + feedback au tap. */
export function Pop({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/* Élément décoratif flottant (blob) en boucle douce. */
export function Floaty({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      aria-hidden
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

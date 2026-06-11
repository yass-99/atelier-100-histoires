"use client";

import { MotionConfig, motion } from "framer-motion";
import type { ReactNode } from "react";
import { T_SLOW } from "@/lib/motion";

/* Fournisseur global : respecte le réglage système « réduire les animations »
   pour toutes les animations Framer du site. */
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
      transition={{ ...T_SLOW, delay }}
    >
      {children}
    </motion.div>
  );
}

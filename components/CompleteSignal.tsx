"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions.shared";

/**
 * Tampon « COMPLET » (cachet encreur) à poser sur une carte/ticket.
 * Le parent doit être `relative`. On passe soit `session`, soit `complete`.
 * `className` positionne le tampon (le span externe), l'effet « coup de cachet »
 * joue à l'apparition sur le span interne (transform isolé du positionnement).
 * Respecte « réduire les animations ».
 */
export function CompleteSignal({
  session,
  complete,
  className = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
}: {
  session?: Session;
  complete?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isComplete =
    complete ?? (session ? placesRestantes(session) <= 0 : false);
  if (!isComplete) return null;

  return (
    <span className={`z-10 ${className}`}>
      <motion.span
        className="stamp inline-block"
        initial={reduce ? false : { scale: 1.6, rotate: -32, opacity: 0 }}
        animate={{ scale: 1, rotate: -12, opacity: 0.8 }}
        // Spring « cachet » : punch bref et net (effet signature, one-shot).
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 19, mass: 0.9 }}
      >
        Complet
      </motion.span>
    </span>
  );
}

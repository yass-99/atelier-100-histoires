"use client";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE, SPRING_SOFT, SPRING_SNAPPY } from "@/lib/motion";

/**
 * Séquence de confirmation : pastille de validation (icône + texte) qui apparaît,
 * tient ~1,7 s, disparaît, puis révèle le contenu (le ticket bleu + la suite).
 * Respecte « réduire les animations » (affiche directement le contenu).
 */
export function ConfirmationReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), reduce ? 0 : 1700);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence mode="wait">
      {!revealed ? (
        <motion.div
          key="success"
          className="flex min-h-[55dvh] flex-col items-center justify-center text-center"
          exit={{ opacity: 0, y: -16, transition: { duration: 0.32, ease: EASE } }}
        >
          <motion.span
            className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lift"
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.1 }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.34 }}
            >
              <Check className="h-10 w-10" strokeWidth={3} aria-hidden />
            </motion.span>
          </motion.span>
          <motion.h1
            className="mt-5 font-display text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.45 }}
          >
            Réservation confirmée&nbsp;!
          </motion.h1>
          <motion.p
            className="mt-1 text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.62 }}
          >
            Ton billet est prêt.
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

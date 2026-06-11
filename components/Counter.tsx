"use client";
import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Compteur chiffré : monte de 0 → `value` quand il entre à l'écran (une fois).
 * Formatage FR (séparateur de milliers, virgule décimale). Respecte
 * « réduire les animations » : affiche directement la valeur finale.
 */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => {
    const formatted =
      decimals > 0
        ? v.toFixed(decimals).replace(".", ",")
        : Math.round(v).toLocaleString("fr-FR");
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, reduce, value, duration, mv]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}

"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Package, Sparkles, ShieldCheck } from "lucide-react";

/**
 * Trois garanties qui lèvent les objections d'achat. Chaque carte a sa couleur
 * (aplat doux) et son icône animée en boucle (flottement + léger balancement,
 * décalé d'une carte à l'autre) pour attirer l'œil. Icônes SVG (jamais d'emoji),
 * contenu centré, non interactif. L'animation respecte prefers-reduced-motion.
 */
const ITEMS = [
  { icon: Package, label: "Matériel fourni", color: "text-brand", bg: "bg-brand-soft" },
  { icon: Sparkles, label: "Débutants bienvenus", color: "text-magenta", bg: "bg-magenta-soft" },
  { icon: ShieldCheck, label: "Annulation gratuite 48 h", color: "text-mint", bg: "bg-mint-soft" },
] as const;

export function ReassuranceStrip() {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-3 gap-2.5" aria-label="Nos garanties">
      {ITEMS.map(({ icon: Icon, label, color, bg }, i) => (
        <li
          key={label}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-ink/12 ${bg} px-2 py-4 text-center`}
        >
          <motion.span
            className={`flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-ink/10 bg-surface ${color}`}
            animate={reduce ? undefined : { y: [0, -5, 0], rotate: [0, -7, 7, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 0.8,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </motion.span>
          <span className="text-center text-[11px] font-bold leading-tight text-foreground">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { AtelierCard } from "./AtelierCard";

/**
 * Aperçu de l'agenda sur la home : les `count` premiers ateliers, suivis d'un
 * bouton « Voir tous les ateliers » vers la page complète (`href`). Pas de
 * filtre par jour ici — c'est une vitrine, le tri/parcours vit sur la page dédiée.
 */
export function SessionsPreview({
  sessions,
  pct = null,
  count = 4,
  href = "/ateliers",
}: {
  sessions: Session[];
  pct?: number | null;
  count?: number;
  href?: string;
}) {
  const shown = sessions.slice(0, count);
  return (
    <div className="space-y-3">
      {shown.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
        >
          <AtelierCard s={s} index={i} pct={pct} />
        </motion.div>
      ))}
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        onClick={() => track("agenda_voir_tous", { total: sessions.length })}
        className="btn-outline mt-1 w-full"
      >
        Voir tous nos ateliers
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}

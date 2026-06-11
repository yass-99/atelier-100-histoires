"use client";
import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import type { Session } from "@/lib/types";
import { buildWeekStrip, dayKey } from "@/lib/dates";
import { EASE } from "@/lib/motion";
import { DayStrip } from "./DayStrip";
import { AtelierCard } from "./AtelierCard";

export function SessionsBoard({
  sessions,
  pct = null,
  step = 6,
}: {
  sessions: Session[];
  pct?: number | null;
  step?: number;
}) {
  const [active, setActive] = useState<string>("all");
  const [count, setCount] = useState(step);
  const cells = useMemo(() => buildWeekStrip(sessions), [sessions]);

  const visible =
    active === "all"
      ? sessions
      : sessions.filter((s) => dayKey(s.date_heure) === active);
  const shown = visible.slice(0, count);
  const restants = visible.length - shown.length;

  return (
    <div className="mt-4">
      {/* Filtres jour. Changer de jour réinitialise le « afficher plus ». */}
      <div>
        <DayStrip
          cells={cells}
          active={active}
          onSelect={(d) => {
            setActive(d);
            setCount(step);
          }}
        />
      </div>

      {/* La liste défile avec la page (pas de hauteur fixe) : sur mobile on voit
          autant d'ateliers que possible, le footer passe sous la liste.
          Chaque carte s'anime à l'apparition à CHAQUE rendu : en revenant sur
          « Tous » ou en changeant de jour, toutes les cartes réapparaissent. */}
      <div className="mt-3 space-y-3">
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

        {restants > 0 && (
          <button
            type="button"
            onClick={() => {
              track("agenda_afficher_plus", { shown: shown.length });
              setCount((c) => c + step);
            }}
            className="btn-outline w-full"
          >
            Afficher plus ({restants} restant{restants > 1 ? "s" : ""})
          </button>
        )}
      </div>
    </div>
  );
}

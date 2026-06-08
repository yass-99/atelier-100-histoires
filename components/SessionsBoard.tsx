"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Session } from "@/lib/types";
import { buildWeekStrip, dayKey } from "@/lib/dates";
import { DayStrip } from "./DayStrip";
import { AtelierCard } from "./AtelierCard";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SessionsBoard({ sessions }: { sessions: Session[] }) {
  const [active, setActive] = useState<string>("all");
  const cells = useMemo(() => buildWeekStrip(sessions), [sessions]);

  const visible =
    active === "all"
      ? sessions
      : sessions.filter((s) => dayKey(s.date_heure) === active);

  return (
    <div className="min-h-[45vh] pb-2">
      <DayStrip cells={cells} active={active} onSelect={setActive} />

      {/* Chaque carte s'anime à l'apparition à CHAQUE rendu : en revenant sur
          « Tous » ou en changeant de jour, toutes les cartes réapparaissent. */}
      <div className="mt-4 space-y-3">
        {visible.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
          >
            <AtelierCard s={s} index={i} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

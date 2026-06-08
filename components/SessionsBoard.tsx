"use client";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/types";
import { groupByDay } from "@/lib/dates";
import { DayStrip, type DayOption } from "./DayStrip";
import { AtelierCard } from "./AtelierCard";
import { FeaturedSession } from "./FeaturedSession";
import { Stagger, StaggerItem } from "./motion";

export function SessionsBoard({ sessions }: { sessions: Session[] }) {
  const [active, setActive] = useState<string>("all");
  const groups = useMemo(() => groupByDay(sessions), [sessions]);
  const days: DayOption[] = groups.map((g) => ({ key: g.key, iso: g.sessions[0].date_heure }));

  const visible = active === "all"
    ? sessions
    : (groups.find((g) => g.key === active)?.sessions ?? []);

  const showFeatured = active === "all" && visible.length > 0;
  const [featured, ...rest] = visible;
  const cards = showFeatured ? rest : visible;

  return (
    <div className="min-h-[45vh] pb-2">
      <DayStrip days={days} active={active} onSelect={setActive} />
      {showFeatured && (
        <div className="mt-4">
          <FeaturedSession s={featured} />
        </div>
      )}
      <Stagger className="mt-4 space-y-3">
        {cards.map((s, i) => (
          <StaggerItem key={s.id}>
            <AtelierCard s={s} index={i + 1} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

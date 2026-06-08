"use client";
import { weekdayShort } from "@/lib/dates";
import { dayNumber } from "@/lib/ui";

export type DayOption = { key: string; iso: string };

/**
 * Strip horizontal de filtres par jour. C'est un filtre (pas des onglets) :
 * boutons-bascule avec aria-pressed dans un groupe étiqueté.
 */
export function DayStrip({
  days, active, onSelect,
}: {
  days: DayOption[];
  active: string; // "all" ou une key
  onSelect: (key: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrer les ateliers par jour"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-pressed={active === "all"}
        aria-label="Tous les jours"
        data-active={active === "all"}
        onClick={() => onSelect("all")}
        className="day-pill min-w-16"
      >
        <span className="text-[11px] font-bold uppercase opacity-70">Tous</span>
        <span className="font-display text-base font-extrabold" aria-hidden>•</span>
      </button>
      {days.map((d) => (
        <button
          key={d.key}
          type="button"
          aria-pressed={active === d.key}
          aria-label={`${weekdayShort(d.iso)} ${dayNumber(d.iso)}`}
          data-active={active === d.key}
          onClick={() => onSelect(d.key)}
          className="day-pill min-w-16"
        >
          <span className="text-[11px] font-bold uppercase opacity-70" aria-hidden>{weekdayShort(d.iso)}</span>
          <span className="font-display text-base font-extrabold" aria-hidden>{dayNumber(d.iso)}</span>
        </button>
      ))}
    </div>
  );
}

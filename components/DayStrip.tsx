"use client";
import { useEffect, useRef } from "react";
import { weekdayShort, isMonday, type DayCell } from "@/lib/dates";
import { dayNumber } from "@/lib/ui";

/**
 * Slider « semaine glissante » lun→dim. Filtre (pas onglets) : boutons-bascule
 * avec aria-pressed. Les jours sans atelier sont grisés/désactivés.
 */
export function DayStrip({
  cells,
  active,
  onSelect,
}: {
  cells: DayCell[];
  active: string; // "all" ou une key
  onSelect: (key: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const firstKey = cells.find((c) => c.hasSession)?.key;

  // Auto-scroll vers le 1ᵉʳ jour utile au montage.
  useEffect(() => {
    if (active === "all" && firstRef.current) {
      firstRef.current.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="Filtrer les ateliers par jour"
      className="-mx-4 flex items-stretch gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-pressed={active === "all"}
        aria-label="Tous les jours"
        data-active={active === "all"}
        onClick={() => onSelect("all")}
        className="day-pill min-w-16"
      >
        <span className="text-[13px] font-bold uppercase">Tous</span>
      </button>

      {cells.map((c) => {
        const sep = isMonday(c.iso);
        return (
          <div key={c.key} className="flex items-stretch">
            {sep && <span className="mx-1 my-2 w-px self-stretch bg-border" aria-hidden />}
            <button
              type="button"
              ref={c.key === firstKey ? firstRef : undefined}
              disabled={!c.hasSession}
              aria-pressed={active === c.key}
              aria-label={`${weekdayShort(c.iso)} ${dayNumber(c.iso)}`}
              data-active={active === c.key}
              onClick={() => c.hasSession && onSelect(c.key)}
              className="day-pill min-w-14 disabled:opacity-35 disabled:active:scale-100"
            >
              <span className="text-[11px] font-bold uppercase opacity-70" aria-hidden>
                {weekdayShort(c.iso)}
              </span>
              <span className="font-display text-base font-extrabold" aria-hidden>
                {dayNumber(c.iso)}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

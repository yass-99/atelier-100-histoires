"use client";
import { weekdayShort } from "@/lib/dates";
import { dayNumber } from "@/lib/ui";

export type DayOption = { key: string; iso: string };

export function DayStrip({
  days, active, onSelect,
}: {
  days: DayOption[];
  active: string; // "all" ou une key
  onSelect: (key: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrer par jour"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        role="tab"
        aria-selected={active === "all"}
        data-active={active === "all"}
        onClick={() => onSelect("all")}
        className="day-pill min-w-16"
      >
        <span className="text-[11px] font-bold uppercase opacity-70">Tous</span>
        <span className="font-display text-base font-extrabold">•</span>
      </button>
      {days.map((d) => (
        <button
          key={d.key}
          role="tab"
          aria-selected={active === d.key}
          data-active={active === d.key}
          onClick={() => onSelect(d.key)}
          className="day-pill min-w-16"
        >
          <span className="text-[11px] font-bold uppercase opacity-70">{weekdayShort(d.iso)}</span>
          <span className="font-display text-base font-extrabold">{dayNumber(d.iso)}</span>
        </button>
      ))}
    </div>
  );
}

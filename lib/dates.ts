import type { Session } from "./types";

/** Clé de jour stable en heure locale : "AAAA-MM-JJ". */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

/** Jour de semaine FR court sans point final (ex. "sam"). */
export function weekdayShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("fr-FR", { weekday: "short" })
    .replace(".", "");
}

export type DayGroup = { key: string; sessions: Session[] };

/** Regroupe les sessions par jour, jours triés croissant (sessions déjà triées en amont). */
export function groupByDay(sessions: Session[]): DayGroup[] {
  const map = new Map<string, Session[]>();
  for (const s of sessions) {
    const k = dayKey(s.date_heure);
    const arr = map.get(k);
    if (arr) arr.push(s);
    else map.set(k, [s]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, sessions]) => ({ key, sessions }));
}

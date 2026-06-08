import type { Session } from "./types";

/**
 * Fuseau de référence : tous les ateliers sont à l'heure de Paris.
 * On fige TOUT le calcul de dates dessus → résultat identique sur le serveur
 * (souvent UTC) et dans le navigateur du visiteur (n'importe quel fuseau),
 * ce qui supprime les mismatches d'hydratation et affiche la bonne heure.
 */
const TZ = "Europe/Paris";

/** Clé de jour stable "AAAA-MM-JJ" en heure de Paris. */
export function dayKey(iso: string): string {
  // en-CA formate en AAAA-MM-JJ.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** Jour de semaine FR court sans point final (ex. "sam"), heure de Paris. */
export function weekdayShort(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short" })
    .format(new Date(iso))
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

/** Une cellule du slider de jours. `hasSession` → cliquable, sinon grisée. */
export type DayCell = { key: string; iso: string; hasSession: boolean };

/** "AAAA-MM-JJ" → Date UTC à midi (arithmétique calendaire sans fuseau). */
function keyToUTC(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Date UTC → "AAAA-MM-JJ" (composantes UTC, déterministe). */
function utcToKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const j = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

/**
 * Construit la bande continue lun→dim couvrant toutes les sessions :
 * du lundi de la 1ʳᵉ semaine au dimanche de la dernière. Chaque jour est marqué
 * `hasSession`. Calcul en UTC sur les clés "AAAA-MM-JJ" (heure de Paris) → grille
 * identique serveur/client. Borné à 26 semaines (garde-fou rendu).
 */
export function buildWeekStrip(sessions: Session[]): DayCell[] {
  if (sessions.length === 0) return [];
  const keys = sessions.map((s) => dayKey(s.date_heure));
  const have = new Set(keys);
  const sorted = [...keys].sort();

  const first = keyToUTC(sorted[0]);
  const last = keyToUTC(sorted[sorted.length - 1]);
  const firstDow = (first.getUTCDay() + 6) % 7; // 0 = lundi
  const lastDow = (last.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - firstDow);
  const end = new Date(last);
  end.setUTCDate(end.getUTCDate() + (6 - lastDow));

  const cells: DayCell[] = [];
  const cur = new Date(start);
  for (let guard = 0; cur <= end && guard < 26 * 7; guard++) {
    const key = utcToKey(cur);
    cells.push({ key, iso: cur.toISOString(), hasSession: have.has(key) });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return cells;
}

/** Vrai si la date est un lundi (pour le séparateur de semaine), heure de Paris. */
export function isMonday(iso: string): boolean {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(
      new Date(iso),
    ) === "Mon"
  );
}

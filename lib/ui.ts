/* Rotation de couleurs pour les cartes (façon pile multicolore de la réf). */
export const CARD_TONES = [
  "tone-brand",
  "tone-amber",
  "tone-magenta",
  "tone-lime",
  "tone-lavender",
] as const;

export function toneForIndex(i: number): string {
  return CARD_TONES[i % CARD_TONES.length];
}

/* Formats de date FR réutilisables (évite la duplication). */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

/* Pour le badge date carré (ex. « 24 » + « sept. »). */
export function dayNumber(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit" });
}

export function monthShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
}

/** Durée en minutes → "1h30" / "45 min" / "2 h". */
export function formatDuree(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

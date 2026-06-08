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

/* Fonds pastel doux pour le talon des cartes-tickets (rotation). */
export const STUB_TONES = [
  "bg-mint-soft",
  "bg-brand-soft",
  "bg-amber-soft",
  "bg-magenta-soft",
] as const;

export function stubToneForIndex(i: number): string {
  return STUB_TONES[i % STUB_TONES.length];
}

/* Fuseau de référence : tous les ateliers sont à l'heure de Paris.
   On le fige sur chaque format → serveur et client affichent la même chose
   (pas de mismatch d'hydratation, heure correcte pour tout visiteur). */
const TZ = "Europe/Paris";

/* Formats de date FR réutilisables (évite la duplication). */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  });
}

/** Heure FR (ex. "14h00" → "14:00"), heure de Paris. */
export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* Pour le badge date carré (ex. « 24 » + « sept. »). */
export function dayNumber(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ, day: "2-digit" });
}

export function monthShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("fr-FR", { timeZone: TZ, month: "short" })
    .replace(".", "");
}

/** Met une majuscule au premier caractère uniquement (évite le « À » parasite de capitalize). */
export function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
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

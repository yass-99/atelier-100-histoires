/** Fonctions pures sur les sessions — utilisables côté client et serveur. */
import type { Session } from "./types";

export function placesRestantes(s: Session): number {
  return Math.max(0, s.capacite - s.places_reservees);
}

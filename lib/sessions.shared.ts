/** Fonctions pures sur les sessions — utilisables côté client et serveur. */
import type { PublicCible, Session } from "./types";

export function placesRestantes(s: Session): number {
  return Math.max(0, s.capacite - s.places_reservees);
}

/** Libellé visiteur du public visé, avec âge minimum éventuel. */
export function publicCibleLabel(publicCible: PublicCible, ageMinimum: number | null): string {
  const base =
    publicCible === "adultes" ? "Adultes" : publicCible === "enfants" ? "Enfants" : "Tous publics";
  if (ageMinimum && publicCible !== "adultes") return `${base} · dès ${ageMinimum} ans`;
  return base;
}

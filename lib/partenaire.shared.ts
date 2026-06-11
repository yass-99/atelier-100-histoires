/** Fonctions pures sur les candidatures « Devenir lieu partenaire » — client et serveur. */

import { normalizeEmail } from "./leads.shared";

/** Types de lieu acceptés pour un partenariat. */
export type TypeLieu =
  | "boulangerie"
  | "restaurant"
  | "cafe"
  | "bistrot"
  | "patisserie"
  | "autre";

/** Liste ordonnée { value, label } — réutilisée par le formulaire et la validation. */
export const TYPES_LIEU: readonly { value: TypeLieu; label: string }[] = [
  { value: "boulangerie", label: "Boulangerie" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bistrot", label: "Bistrot" },
  { value: "patisserie", label: "Pâtisserie" },
  { value: "autre", label: "Autre" },
];

/** Créneaux d'accueil possibles (multi-sélection, optionnel). */
export type Creneau = "matin" | "midi" | "apres_midi" | "soir" | "jour_fermeture";

/** Liste ordonnée { value, label } — « Soir » et « Jour de fermeture » en tête (les plus utiles). */
export const CRENEAUX: readonly { value: Creneau; label: string }[] = [
  { value: "soir", label: "Soir" },
  { value: "matin", label: "Matin" },
  { value: "midi", label: "Midi" },
  { value: "apres_midi", label: "Après-midi" },
  { value: "jour_fermeture", label: "Jour de fermeture" },
];

/** Candidature normalisée, prête à insérer en base. */
export type PartenaireInput = {
  nom_lieu: string;
  type_lieu: TypeLieu;
  prenom: string;
  email: string;
  phone: string;
  ville: string;
  places_assises: number;
  creneaux: Creneau[];
  lien: string | null;
  message: string | null;
  source: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPE_VALUES = new Set<string>(TYPES_LIEU.map((t) => t.value));
const CRENEAU_VALUES = new Set<string>(CRENEAUX.map((c) => c.value));

/** Renvoie la chaîne trimmée si non vide, sinon null (champs optionnels). */
function optStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/**
 * Valide et normalise une candidature partenaire. Renvoie `{ ok, value }` ou
 * `{ ok: false, error }` avec un message FR adapté au premier champ fautif.
 */
export function parsePartenaireInput(
  raw: unknown,
): { ok: true; value: PartenaireInput } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null)
    return { ok: false, error: "Candidature invalide." };
  const r = raw as Record<string, unknown>;

  const nom_lieu = typeof r.nom_lieu === "string" ? r.nom_lieu.trim() : "";
  if (nom_lieu === "") return { ok: false, error: "Le nom de l'établissement est requis." };

  if (typeof r.type_lieu !== "string" || !TYPE_VALUES.has(r.type_lieu))
    return { ok: false, error: "Choisis un type de lieu." };
  const type_lieu = r.type_lieu as TypeLieu;

  const prenom = typeof r.prenom === "string" ? r.prenom.trim() : "";
  if (prenom === "") return { ok: false, error: "Ton prénom est requis." };

  if (typeof r.email !== "string" || !EMAIL_RE.test(r.email.trim()))
    return { ok: false, error: "Email invalide." };
  const email = normalizeEmail(r.email);

  const phone = typeof r.phone === "string" ? r.phone.trim() : "";
  if (phone === "") return { ok: false, error: "Le téléphone est requis." };

  const ville = typeof r.ville === "string" ? r.ville.trim() : "";
  if (ville === "") return { ok: false, error: "La ville ou le quartier est requis." };

  const places_assises = Number(r.places_assises);
  if (!Number.isInteger(places_assises) || places_assises < 1)
    return { ok: false, error: "Le nombre de places assises doit être un entier positif." };

  // Créneaux : on ne garde que les valeurs connues, sans doublon, ordre préservé.
  let creneaux: Creneau[] = [];
  if (Array.isArray(r.creneaux)) {
    creneaux = Array.from(
      new Set(r.creneaux.filter((c): c is Creneau => typeof c === "string" && CRENEAU_VALUES.has(c))),
    );
  }

  return {
    ok: true,
    value: {
      nom_lieu,
      type_lieu,
      prenom,
      email,
      phone,
      ville,
      places_assises,
      creneaux,
      lien: optStr(r.lien),
      message: optStr(r.message),
      source: optStr(r.source),
    },
  };
}

/** Fonctions pures sur les demandes de devis « Crée ton atelier » — client et serveur. */

import { normalizeEmail } from "./leads.shared";

/** Occasions proposées pour un atelier privé sur-mesure. */
export type Occasion =
  | "evjf"
  | "anniversaire"
  | "team_building"
  | "entre_amis"
  | "autre";

/** Liste ordonnée { value, label } — réutilisée par le formulaire et la validation. */
export const OCCASIONS: readonly { value: Occasion; label: string }[] = [
  { value: "anniversaire", label: "Anniversaire" },
  { value: "entre_amis", label: "Entre amis" },
  { value: "team_building", label: "Sortie d'équipe" },
  { value: "evjf", label: "Enterrement de vie" },
  { value: "autre", label: "Autre" },
];

/** Demande normalisée, prête à insérer en base. */
export type DevisInput = {
  prenom: string;
  email: string;
  phone: string | null;
  occasion: Occasion;
  nb_personnes: number | null;
  type_atelier: string | null;
  dates_souhaitees: string | null;
  message: string | null;
  source: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OCCASION_VALUES = new Set<string>(OCCASIONS.map((o) => o.value));

/** Renvoie la chaîne trimmée si non vide, sinon null (champs optionnels). */
function optStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/**
 * Valide et normalise une demande de devis. Renvoie `{ ok, value }` ou
 * `{ ok: false, error }` avec un message FR adapté au premier champ fautif.
 */
export function parseDevisInput(
  raw: unknown,
): { ok: true; value: DevisInput } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null)
    return { ok: false, error: "Demande invalide." };
  const r = raw as Record<string, unknown>;

  const prenom = typeof r.prenom === "string" ? r.prenom.trim() : "";
  if (prenom === "") return { ok: false, error: "Ton prénom est requis." };

  if (typeof r.email !== "string" || !EMAIL_RE.test(r.email.trim()))
    return { ok: false, error: "Email invalide." };
  const email = normalizeEmail(r.email);

  if (typeof r.occasion !== "string" || !OCCASION_VALUES.has(r.occasion))
    return { ok: false, error: "Choisis une occasion." };
  const occasion = r.occasion as Occasion;

  let nb_personnes: number | null = null;
  if (r.nb_personnes !== undefined && r.nb_personnes !== null && r.nb_personnes !== "") {
    const n = Number(r.nb_personnes);
    if (!Number.isInteger(n) || n < 1)
      return { ok: false, error: "Le nombre de personnes doit être un entier positif." };
    nb_personnes = n;
  }

  return {
    ok: true,
    value: {
      prenom,
      email,
      occasion,
      nb_personnes,
      phone: optStr(r.phone),
      type_atelier: optStr(r.type_atelier),
      dates_souhaitees: optStr(r.dates_souhaitees),
      message: optStr(r.message),
      source: optStr(r.source),
    },
  };
}

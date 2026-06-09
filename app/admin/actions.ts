"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import type { PublicCible, SessionStatus } from "@/lib/types";

export type NewSessionInput = {
  titre: string;
  description: string;
  dateISO: string; // ISO complet (déjà converti côté client)
  duree: number; // minutes
  lieu: string;
  capacite: number;
  prix_cents: number;
  statut: SessionStatus;
  image_urls: string[];
  a_la_une: boolean;
  public_cible: PublicCible;
  age_minimum: number | null;
  conso_incluse: boolean;
  conso_detail: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createSession(input: NewSessionInput): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Accès refusé." };
  }

  const titre = input.titre?.trim();
  const date = new Date(input.dateISO);
  if (!titre) return { ok: false, error: "Le titre est obligatoire." };
  if (isNaN(date.getTime())) return { ok: false, error: "Date invalide." };
  if (!Number.isFinite(input.duree) || input.duree <= 0)
    return { ok: false, error: "Durée invalide." };
  if (!Number.isFinite(input.capacite) || input.capacite <= 0)
    return { ok: false, error: "Capacité invalide." };
  if (!Number.isFinite(input.prix_cents) || input.prix_cents < 0)
    return { ok: false, error: "Prix invalide." };

  const publics: PublicCible[] = ["adultes", "enfants", "tous"];
  if (!publics.includes(input.public_cible))
    return { ok: false, error: "Public invalide." };
  // Âge minimum : pertinent seulement pour enfants/tous publics.
  const ageMin =
    input.public_cible !== "adultes" &&
    input.age_minimum != null &&
    Number.isFinite(input.age_minimum) &&
    input.age_minimum > 0
      ? Math.round(input.age_minimum)
      : null;

  const images = (input.image_urls ?? []).map((u) => u.trim()).filter(Boolean);

  const db = createAdminClient();
  const { error } = await db.from("sessions").insert({
    titre,
    description: input.description?.trim() ?? "",
    date_heure: date.toISOString(),
    duree: Math.round(input.duree),
    lieu: input.lieu?.trim() ?? "",
    capacite: Math.round(input.capacite),
    prix_cents: Math.round(input.prix_cents),
    statut: input.statut,
    image_urls: images,
    image_url: images[0] ?? null, // image principale (e-ticket, partage)
    a_la_une: !!input.a_la_une,
    public_cible: input.public_cible,
    age_minimum: ageMin,
    conso_incluse: !!input.conso_incluse,
    conso_detail: input.conso_incluse ? input.conso_detail?.trim() || null : null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function setSessionStatus(id: string, statut: SessionStatus): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("sessions").update({ statut }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/");
}

/** Met l'atelier en avant (ou le retire) dans le hero « À la une » de l'accueil. */
export async function setSessionFeatured(id: string, a_la_une: boolean): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("sessions").update({ a_la_une }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteSession(id: string): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  // FK on delete restrict : échoue s'il existe des réservations (sécurité).
  const { error } = await db.from("sessions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/");
}

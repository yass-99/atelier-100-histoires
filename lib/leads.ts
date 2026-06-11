import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "./supabase/server";
import { drawDiscount, normalizeEmail, type MysteryDiscount } from "./leads.shared";

/**
 * Tire (ou retrouve) la remise mystère d'un email consenti. Idempotent.
 * `isNew` vaut true uniquement lors de la toute première capture de cet email
 * (sert à n'envoyer l'email de bienvenue qu'une fois).
 */
export async function claimMysteryDiscount(
  rawEmail: string,
): Promise<{ pct: MysteryDiscount; isNew: boolean }> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { data: existing, error: e1 } = await db
    .from("leads")
    .select("discount_pct")
    .eq("email", email)
    .maybeSingle();
  if (e1) throw e1;
  if (existing) return { pct: existing.discount_pct as MysteryDiscount, isNew: false };

  const pct = drawDiscount();
  const { error } = await db.from("leads").insert({ email, consent: true, discount_pct: pct });
  if (error) {
    // Course (double envoi) : l'unique sur email a gagné — relire le tirage existant.
    const { data } = await db
      .from("leads")
      .select("discount_pct")
      .eq("email", email)
      .maybeSingle();
    if (data) return { pct: data.discount_pct as MysteryDiscount, isNew: false };
    throw error;
  }
  return { pct, isNew: true };
}

/** Remise active (consentie, jamais utilisée) pour un email, sinon null. */
export async function findActiveDiscount(rawEmail: string): Promise<MysteryDiscount | null> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { data, error } = await db
    .from("leads")
    .select("discount_pct")
    .eq("email", email)
    .eq("consent", true)
    .is("used_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data?.discount_pct as MysteryDiscount | undefined) ?? null;
}

/**
 * Remise active de l'utilisateur CONNECTÉ (sur son email vérifié Clerk), sinon
 * null. Source de vérité pour l'affichage (bandeau, prix barrés) et garde-fou
 * anti-abus : une remise n'est utilisable que par le compte propriétaire de
 * l'email — re-tirer en navigation anonyme / via une autre IP ne sert à rien.
 * `cache()` la déduplique sur une même requête (layout + page).
 */
export const getMyDiscount = cache(async (): Promise<MysteryDiscount | null> => {
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;
  return findActiveDiscount(email).catch(() => null);
});

/** Marque la remise consommée (idempotent : ne touche que used_at nul). */
export async function markDiscountUsed(rawEmail: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { error } = await db
    .from("leads")
    .update({ used_at: new Date().toISOString() })
    .eq("email", email)
    .is("used_at", null);
  if (error) throw error;
}

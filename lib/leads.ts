import "server-only";
import { createAdminClient } from "./supabase/server";
import { drawDiscount, normalizeEmail, type MysteryDiscount } from "./leads.shared";

/** Tire (ou retrouve) la remise mystère d'un email consenti. Idempotent. */
export async function claimMysteryDiscount(rawEmail: string): Promise<MysteryDiscount> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { data: existing, error: e1 } = await db
    .from("leads")
    .select("discount_pct")
    .eq("email", email)
    .maybeSingle();
  if (e1) throw e1;
  if (existing) return existing.discount_pct as MysteryDiscount;

  const pct = drawDiscount();
  const { error } = await db.from("leads").insert({ email, consent: true, discount_pct: pct });
  if (error) {
    // Course (double envoi) : l'unique sur email a gagné — relire le tirage existant.
    const { data } = await db
      .from("leads")
      .select("discount_pct")
      .eq("email", email)
      .maybeSingle();
    if (data) return data.discount_pct as MysteryDiscount;
    throw error;
  }
  return pct;
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

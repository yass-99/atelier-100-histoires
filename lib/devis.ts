import "server-only";
import { createAdminClient } from "./supabase/server";
import type { DevisInput } from "./devis.shared";

/**
 * Enregistre une demande de devis « Crée ton atelier » et renvoie son id.
 * La validation/normalisation est faite en amont par `parseDevisInput`.
 */
export async function createDevisRequest(input: DevisInput): Promise<{ id: string }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("devis_requests")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

import "server-only";
import { createAdminClient } from "./supabase/server";
import type { PartenaireInput } from "./partenaire.shared";

/**
 * Enregistre une candidature de lieu partenaire et renvoie son id.
 * La validation/normalisation est faite en amont par `parsePartenaireInput`.
 */
export async function createPartenaireRequest(input: PartenaireInput): Promise<{ id: string }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("partenaire_requests")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

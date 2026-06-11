import "server-only";
import { createAdminClient } from "./supabase/server";
import type { TypeLieu } from "./partenaire.shared";

/**
 * Lieu partenaire PUBLIÉ (vitrine). À ne pas confondre avec une candidature
 * (`partenaire_requests`) : ici ce sont les lieux validés affichés sur le site.
 */
export type LieuPartenaire = {
  id: string;
  nom: string;
  type_lieu: TypeLieu;
  ville: string;
  pitch: string | null;
  lien: string | null;
  image_url: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
};

/** Liste des lieux partenaires actifs, dans l'ordre d'affichage choisi. */
export async function listLieuxPartenaires(): Promise<LieuPartenaire[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("lieux_partenaires")
    .select("*")
    .eq("actif", true)
    .order("ordre", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LieuPartenaire[];
}

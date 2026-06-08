import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/server";
import type { Session } from "./types";

/**
 * Liste des ateliers publiés à venir.
 * Mise en cache (revalidation 300 s, tag `sessions`) pour ne pas retaper la base
 * à chaque visite, quel que soit le mode de rendu de la page.
 */
export const listPublishedSessions = unstable_cache(
  async (): Promise<Session[]> => {
    const db = createAdminClient();
    const { data, error } = await db
      .from("sessions")
      .select("*")
      .eq("statut", "publie")
      .gte("date_heure", new Date().toISOString())
      .order("date_heure", { ascending: true });
    if (error) throw error;
    return data as Session[];
  },
  ["published-sessions"],
  { revalidate: 300, tags: ["sessions"] },
);

export async function getSession(id: string): Promise<Session | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Session | null;
}

// Re-export pure helper so server components can still import from here.
export { placesRestantes } from "./sessions.shared";

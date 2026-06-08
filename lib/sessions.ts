import "server-only";
import { createAdminClient } from "./supabase/server";
import type { Session } from "./types";

export async function listPublishedSessions(): Promise<Session[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("sessions")
    .select("*")
    .eq("statut", "publie")
    .gte("date_heure", new Date().toISOString())
    .order("date_heure", { ascending: true });
  if (error) throw error;
  return data as Session[];
}

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

export function placesRestantes(s: Session): number {
  return Math.max(0, s.capacite - s.places_reservees);
}

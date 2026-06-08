import "server-only";
import { createAdminClient } from "./supabase/server";
import type { Booking } from "./types";

export async function reserveSeats(sessionId: string, qty: number): Promise<boolean> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("reserve_seats", {
    p_session_id: sessionId,
    p_qty: qty,
  });
  if (error) throw error;
  return data === true;
}

export async function releaseSeats(sessionId: string, qty: number): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.rpc("release_seats", {
    p_session_id: sessionId,
    p_qty: qty,
  });
  if (error) throw error;
}

export async function createPendingBooking(b: {
  session_id: string;
  email: string;
  nom: string;
  nb_places: number;
  montant_cents: number;
  clerk_user_id: string | null;
}): Promise<Booking> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("bookings")
    .insert({ ...b, statut: "pending" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function attachStripeSession(bookingId: string, stripeSessionId: string) {
  const db = createAdminClient();
  const { error } = await db
    .from("bookings")
    .update({ stripe_session_id: stripeSessionId })
    .eq("id", bookingId);
  if (error) throw error;
}

// Idempotent : ne confirme que les bookings encore "pending".
export async function confirmBooking(stripeSessionId: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("bookings")
    .update({ statut: "confirmed" })
    .eq("stripe_session_id", stripeSessionId)
    .eq("statut", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}

export async function cancelBooking(stripeSessionId: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("bookings")
    .update({ statut: "cancelled" })
    .eq("stripe_session_id", stripeSessionId)
    .eq("statut", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}

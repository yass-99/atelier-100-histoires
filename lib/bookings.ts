import "server-only";
import { createAdminClient } from "./supabase/server";
import { stripe } from "./stripe";
import type { Booking, Session } from "./types";

export type BookingWithSession = Booking & { session: Session | null };

/**
 * Réservations confirmées d'un utilisateur : par compte Clerk OU par email
 * (couvre les achats faits avant la création du compte). Jointe à la session.
 */
/**
 * Rattache au compte les réservations « orphelines » faites avec le même email
 * (achat avant création du compte). Idempotent : ne touche que les lignes dont
 * `clerk_user_id` est nul. Email comparé sans tenir compte de la casse.
 */
export async function linkBookingsToUser(
  userId: string,
  email: string | null,
): Promise<void> {
  if (!email) return;
  const db = createAdminClient();
  const { error } = await db
    .from("bookings")
    .update({ clerk_user_id: userId })
    .is("clerk_user_id", null)
    .ilike("email", email);
  if (error) throw error;
}

export async function listUserBookings(
  userId: string | null,
  email: string | null,
): Promise<BookingWithSession[]> {
  const db = createAdminClient();
  const byId = new Map<string, Booking>();

  async function run(col: "clerk_user_id" | "email", val: string) {
    const base = db.from("bookings").select("*").eq("statut", "confirmed");
    // email : comparaison insensible à la casse (ilike sans joker).
    const filtered = col === "email" ? base.ilike(col, val) : base.eq(col, val);
    const { data, error } = await filtered.order("created_at", { ascending: false });
    if (error) throw error;
    for (const b of (data ?? []) as Booking[]) byId.set(b.id, b);
  }

  if (userId) await run("clerk_user_id", userId);
  if (email) await run("email", email);

  const bookings = [...byId.values()];
  if (bookings.length === 0) return [];

  const sessionIds = [...new Set(bookings.map((b) => b.session_id))];
  const { data: sessions, error } = await db
    .from("sessions")
    .select("*")
    .in("id", sessionIds);
  if (error) throw error;
  const sessionById = new Map((sessions as Session[]).map((s) => [s.id, s]));

  return bookings.map((b) => ({ ...b, session: sessionById.get(b.session_id) ?? null }));
}

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

/**
 * Filet de sécurité (webhook manqué/différé) : si la réservation est encore
 * `pending`, vérifie le paiement directement auprès de Stripe et la confirme si
 * c'est payé. Retourne le booking à jour. Idempotent et sans effet si déjà confirmé.
 */
export async function confirmBookingIfPaid(booking: Booking): Promise<Booking> {
  if (booking.statut !== "pending" || !booking.stripe_session_id) return booking;
  try {
    const cs = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
    if (cs.payment_status !== "paid") return booking;
  } catch {
    return booking; // Stripe indisponible → on laisse le webhook faire le travail
  }
  const confirmed = await confirmBooking(booking.stripe_session_id);
  return confirmed ?? { ...booking, statut: "confirmed" };
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

export async function getBooking(id: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}

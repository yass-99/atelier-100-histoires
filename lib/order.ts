import "server-only";
import type { Booking } from "./types";
import { confirmBooking } from "./bookings";
import { getSession } from "./sessions";
import { stripe } from "./stripe";
import { sendConfirmation, notifyOrganizer } from "./email";
import { markDiscountUsed } from "./leads";

/**
 * Finalise une réservation payée : confirme la transition `pending→confirmed`
 * (atomique) PUIS déclenche les effets de bord — emails de confirmation et
 * consommation de la remise mystère.
 *
 * Point clé : `confirmBooking` ne renvoie le booking qu'au SEUL appelant qui
 * gagne la transition atomique. Les effets de bord (donc l'email) ne partent
 * donc qu'une fois, peu importe qui finalise en premier — le webhook Stripe ou
 * le filet de sécurité de la page /merci. Le perdant reçoit `null` et ne refait
 * rien. Les envois sont best-effort (un échec n'annule pas la confirmation).
 */
export async function finalizeBooking(
  stripeSessionId: string,
  mysteryEmail?: string | null,
): Promise<Booking | null> {
  const booking = await confirmBooking(stripeSessionId); // idempotent (pending → confirmed)
  if (!booking) return null; // déjà finalisé par l'autre chemin → ne rien refaire

  // Remise mystère : consommée seulement au paiement confirmé.
  if (mysteryEmail) {
    try {
      await markDiscountUsed(mysteryEmail);
    } catch (e) {
      console.error("Echec marquage remise (non bloquant) :", e);
    }
  }

  const s = await getSession(booking.session_id);
  if (s) {
    try {
      await sendConfirmation(booking, s);
      await notifyOrganizer(booking, s);
    } catch (e) {
      console.error("Echec envoi email confirmation (non bloquant) :", e);
    }
  }
  return booking;
}

/**
 * Filet de sécurité pour /merci (webhook différé/manqué) : si la réservation est
 * encore `pending`, vérifie le paiement auprès de Stripe et, si c'est payé, la
 * finalise (confirmation + emails via {@link finalizeBooking}). Retourne le
 * booking à jour. Sans effet si déjà confirmé.
 */
export async function finalizeIfPaid(booking: Booking): Promise<Booking> {
  if (booking.statut !== "pending" || !booking.stripe_session_id) return booking;
  let mysteryEmail: string | null | undefined;
  try {
    const cs = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
    if (cs.payment_status !== "paid") return booking;
    mysteryEmail = cs.metadata?.mystery_email;
  } catch {
    return booking; // Stripe indisponible → on laisse le webhook faire le travail
  }
  const confirmed = await finalizeBooking(booking.stripe_session_id, mysteryEmail);
  return confirmed ?? { ...booking, statut: "confirmed" };
}

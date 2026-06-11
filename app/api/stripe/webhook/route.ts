import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cancelBooking, releaseSeats } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { sendAbandonedCart } from "@/lib/email";
import { finalizeBooking } from "@/lib/order";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // corps BRUT requis pour la vérif de signature
  if (!sig) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as { id: string; metadata?: Record<string, string> };
    // Confirme + envoie les emails + consomme la remise (une seule fois : voir
    // finalizeBooking). Le filet de sécurité de /merci appelle le même chemin.
    await finalizeBooking(cs.id, cs.metadata?.mystery_email);
  }

  if (event.type === "checkout.session.expired") {
    const cs = event.data.object as { id: string };
    const booking = await cancelBooking(cs.id); // idempotent (pending → cancelled)
    if (booking) {
      await releaseSeats(booking.session_id, booking.nb_places);
      // Relance panier abandonné : non bloquante, seulement si l'atelier est
      // encore réservable (la place vient d'être libérée).
      const s = await getSession(booking.session_id);
      if (s && s.statut === "publie") {
        try {
          await sendAbandonedCart(booking, s);
        } catch (e) {
          console.error("Echec envoi relance panier (non bloquant) :", e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

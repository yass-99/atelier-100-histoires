import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { confirmBooking, cancelBooking, releaseSeats } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { sendConfirmation, notifyOrganizer } from "@/lib/email";

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
    const cs = event.data.object as { id: string };
    const booking = await confirmBooking(cs.id); // idempotent
    if (booking) {
      const s = await getSession(booking.session_id);
      if (s) {
        // Emails non-bloquants : un échec d'envoi ne doit pas faire échouer
        // le webhook (la réservation est déjà confirmée).
        try {
          await sendConfirmation(booking, s);
          await notifyOrganizer(booking, s);
        } catch (e) {
          console.error("Echec envoi email (non bloquant) :", e);
        }
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const cs = event.data.object as { id: string };
    const booking = await cancelBooking(cs.id);
    if (booking) await releaseSeats(booking.session_id, booking.nb_places);
  }

  return NextResponse.json({ received: true });
}

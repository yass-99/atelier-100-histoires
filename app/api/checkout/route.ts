import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSession } from "@/lib/sessions";
import {
  reserveSeats,
  releaseSeats,
  createPendingBooking,
  attachStripeSession,
} from "@/lib/bookings";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { sessionId, nb_places, nom, email } = await req.json();
  const qty = Number(nb_places);
  if (!sessionId || !qty || qty < 1 || !nom || !email) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const s = await getSession(sessionId);
  if (!s || s.statut !== "publie") {
    return NextResponse.json({ error: "Atelier indisponible" }, { status: 404 });
  }

  // 1) Réservation atomique des places (anti-survente)
  const ok = await reserveSeats(sessionId, qty);
  if (!ok) {
    return NextResponse.json({ error: "Plus assez de places" }, { status: 409 });
  }

  try {
    const { userId } = await auth();
    const montant = s.prix_cents * qty;
    const booking = await createPendingBooking({
      session_id: sessionId,
      email,
      nom,
      nb_places: qty,
      montant_cents: montant,
      clerk_user_id: userId ?? null,
    });

    const base = process.env.NEXT_PUBLIC_APP_URL!;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
      customer_email: email,
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: "eur",
            unit_amount: s.prix_cents,
            product_data: { name: s.titre },
          },
        },
      ],
      metadata: { booking_id: booking.id, session_id: sessionId, nb_places: String(qty) },
      success_url: `${base}/merci?b=${booking.id}`,
      cancel_url: `${base}/ateliers/${sessionId}`,
    });

    await attachStripeSession(booking.id, checkout.id);
    return NextResponse.json({ url: checkout.url });
  } catch {
    // Rollback des places si la création Stripe échoue
    await releaseSeats(sessionId, qty);
    return NextResponse.json({ error: "Erreur de paiement" }, { status: 500 });
  }
}

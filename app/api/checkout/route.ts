import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSession } from "@/lib/sessions";
import {
  reserveSeats,
  releaseSeats,
  createPendingBooking,
  attachStripeSession,
} from "@/lib/bookings";
import { ensureMysteryCoupon, stripe } from "@/lib/stripe";
import { findActiveDiscount } from "@/lib/leads";

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

    // Remise mystère éventuelle (la réservation prime : toute erreur → sans remise)
    let discounts: { coupon: string }[] | undefined;
    let pct = 0;
    const found = await findActiveDiscount(email).catch(() => null);
    if (found) {
      try {
        discounts = [{ coupon: await ensureMysteryCoupon(found) }];
        pct = found;
      } catch {
        discounts = undefined;
      }
    }

    const montant = Math.round((s.prix_cents * qty * (100 - pct)) / 100);
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
      discounts,
      metadata: {
        booking_id: booking.id,
        session_id: sessionId,
        nb_places: String(qty),
        mystery_email: pct ? email : "",
        mystery_pct: String(pct),
      },
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

import { NextResponse } from "next/server";
import type { Booking, Session } from "@/lib/types";
import { confirmationEmailHtml } from "@/lib/email-template";

export const dynamic = "force-dynamic";

// Aperçu du mail de confirmation (données d'exemple). Désactivé en production.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = {
    id: "demo-session",
    titre: "Atelier bijoux en boulangerie",
    description: "",
    date_heure: "2026-07-18T14:00:00.000Z",
    duree: 120,
    lieu: "Paris 11e",
    capacite: 12,
    prix_cents: 3500,
    image_url: null,
    image_urls: null,
    a_la_une: false,
    public_cible: "tous",
    age_minimum: 7,
    conso_incluse: true,
    conso_detail: "boisson chaude + pâtisserie incluses",
    statut: "publie",
    places_reservees: 4,
    created_at: "2026-06-09T10:00:00.000Z",
  } satisfies Session;

  const booking = {
    id: "0a6fb76d-1f08-4050-a9ab-2bac10c542c4",
    session_id: "demo-session",
    clerk_user_id: null,
    email: "client@example.com",
    nom: "Camille Martin",
    nb_places: 2,
    montant_cents: 7000,
    statut: "confirmed",
    stripe_session_id: "cs_test_demo",
    created_at: "2026-06-09T10:05:00.000Z",
  } satisfies Booking;

  return new NextResponse(confirmationEmailHtml(booking, session), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

import { NextResponse } from "next/server";
import { claimMysteryDiscount } from "@/lib/leads";
import { sendLeadWelcome } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, consent } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  if (consent !== true)
    return NextResponse.json(
      { error: "Le consentement est requis pour recevoir l'offre." },
      { status: 400 },
    );
  try {
    const { pct, isNew } = await claimMysteryDiscount(email);
    // Email de bienvenue : seulement à la première capture, non bloquant.
    if (isNew) {
      try {
        await sendLeadWelcome(email.trim(), pct);
      } catch (e) {
        console.error("Echec envoi email bienvenue lead (non bloquant) :", e);
      }
    }
    return NextResponse.json({ pct });
  } catch {
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie." }, { status: 500 });
  }
}

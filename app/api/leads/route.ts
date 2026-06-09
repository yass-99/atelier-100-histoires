import { NextResponse } from "next/server";
import { claimMysteryDiscount } from "@/lib/leads";

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
    const pct = await claimMysteryDiscount(email);
    return NextResponse.json({ pct });
  } catch {
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie." }, { status: 500 });
  }
}

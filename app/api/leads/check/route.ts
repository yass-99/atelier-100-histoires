import { NextResponse } from "next/server";
import { findActiveDiscount } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Indique seulement si une remise mystère est disponible pour cet email.
 * Ne révèle rien d'autre, et ne renvoie jamais d'erreur bloquante :
 * la réservation prime sur la promo.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ pct: null });
  try {
    const pct = await findActiveDiscount(email);
    return NextResponse.json({ pct });
  } catch {
    return NextResponse.json({ pct: null });
  }
}

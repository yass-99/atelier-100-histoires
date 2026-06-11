import { NextResponse } from "next/server";
import { parseDevisInput } from "@/lib/devis.shared";
import { createDevisRequest } from "@/lib/devis";
import { sendDevisAck, notifyDevisRequest } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // À défaut de source explicite (UTM transmis par le form), retomber sur le referer.
  if (body && typeof body === "object" && !body.source) {
    const ref = req.headers.get("referer");
    if (ref) body.source = ref;
  }

  const parsed = parseDevisInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const { id } = await createDevisRequest(parsed.value);
    // Emails non bloquants : la demande est toujours enregistrée même si Resend échoue.
    try {
      await Promise.all([
        sendDevisAck({ ...parsed.value, id }),
        notifyDevisRequest({ ...parsed.value, id }),
      ]);
    } catch (e) {
      console.error("Echec envoi email(s) devis (non bloquant) :", e);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie." }, { status: 500 });
  }
}

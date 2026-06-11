import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

// Statut admin de l'utilisateur courant. Contrôle autoritatif côté serveur
// (la liste ADMIN_EMAILS ne quitte jamais le serveur) ; sert seulement à
// afficher ou non le raccourci « Admin » dans le menu.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}

import Link from "next/link";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";

export function FeaturedSession({ s }: { s: Session }) {
  const restantes = placesRestantes(s);
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="rounded-card bg-brand p-6 shadow-card">
      <span className="chip bg-surface text-ink">Prochain atelier</span>
      <h2 className="mt-3 text-2xl text-ink">{s.titre}</h2>
      <p className="mt-1 capitalize text-ink/80">{date}</p>
      <p className="text-ink/80">{s.lieu}</p>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-2xl text-ink">{formatEUR(s.prix_cents)}</p>
        <Link href={`/ateliers/${s.id}`} className="btn-primary">
          {restantes > 0 ? "Réserver" : "Voir l’atelier"}
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";

export function SessionRow({ s }: { s: Session }) {
  const restantes = placesRestantes(s);
  const date = new Date(s.date_heure).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  return (
    <Link
      href={`/ateliers/${s.id}`}
      className="card-flat flex items-center justify-between gap-3"
    >
      <div>
        <p className="text-xs capitalize text-muted">{date}</p>
        <h3 className="text-lg">{s.titre}</h3>
        <span
          className={`badge mt-1 ${
            restantes > 0 ? "bg-brand-soft text-ink" : "bg-magenta-soft text-ink"
          }`}
        >
          {restantes > 0 ? `${restantes} places` : "Complet"}
        </span>
      </div>
      <p className="shrink-0 text-xl">{formatEUR(s.prix_cents)}</p>
    </Link>
  );
}

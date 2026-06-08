import { notFound } from "next/navigation";
import { getSession, placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";
import { ReserveForm } from "./reserve-form";

export const dynamic = "force-dynamic";

export default async function AtelierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="screen py-8">
      <h1 className="text-3xl leading-tight">{s.titre}</h1>
      <p className="mt-2 capitalize text-muted">{date}</p>
      <p className="text-muted">{s.lieu}</p>
      <p className="mt-2 text-2xl">
        {formatEUR(s.prix_cents)} <span className="text-sm text-muted">/ place</span>
      </p>

      <span
        className={`chip mt-4 ${
          restantes > 0 ? "bg-brand-soft text-ink" : "bg-magenta-soft text-ink"
        }`}
      >
        {restantes > 0 ? `${restantes} places restantes` : "Complet"}
      </span>

      {s.description && (
        <p className="mt-4 whitespace-pre-line">{s.description}</p>
      )}

      {restantes > 0 ? (
        <ReserveForm sessionId={s.id} max={restantes} />
      ) : (
        <p className="mt-6 text-muted">Cet atelier est complet.</p>
      )}
    </main>
  );
}

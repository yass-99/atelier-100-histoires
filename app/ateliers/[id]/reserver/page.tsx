import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { formatDateLong, capitalizeFirst } from "@/lib/ui";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ReserveForm } from "../reserve-form";

export const dynamic = "force-dynamic";

export default async function ReserverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();
  const restantes = placesRestantes(s);
  if (restantes <= 0) notFound();

  return (
    <main className="screen py-5 pb-28">
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <CircleButton as="link" href={`/ateliers/${s.id}`} label="Retour à l'atelier">
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </CircleButton>
        </div>
        <h1 className="font-display text-2xl">Réserver ma place</h1>
      </div>

      {/* Récap en forme de ticket */}
      <Reveal className="mt-6">
        <div className="ticket">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Atelier des 100 histoires</p>
          <h2 className="mt-1 font-display text-xl leading-tight text-white">{s.titre}</h2>
          <p className="mt-1.5 font-bold text-white/90">{capitalizeFirst(formatDateLong(s.date_heure))}</p>

          <div className="ticket-perf">
            <span className="ticket-notch ticket-notch-left" aria-hidden />
            <span className="ticket-notch ticket-notch-right" aria-hidden />
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Prix par place</span>
            <span className="font-display text-2xl font-extrabold text-white">{formatEUR(s.prix_cents)}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <ReserveForm sessionId={s.id} max={restantes} prixCents={s.prix_cents} />
      </Reveal>
    </main>
  );
}

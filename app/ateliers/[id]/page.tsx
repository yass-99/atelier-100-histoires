import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { getSession, placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";
import { formatDateLong, dayNumber, monthShort } from "@/lib/ui";
import { Reveal, Floaty } from "@/components/motion";
import { ReserveForm } from "./reserve-form";

export const dynamic = "force-dynamic";

function formatDuree(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export default async function AtelierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <main className="screen py-6">
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          Tous les ateliers
        </Link>
      </Reveal>

      <Reveal delay={0.05} className="mt-4">
        <div className="relative overflow-hidden rounded-card tone-brand p-6 shadow-lift">
          <Floaty className="blob -right-12 -top-14 h-48 w-48 bg-white/25" />
          <Floaty className="blob -bottom-16 -left-12 h-44 w-44 bg-magenta/30" />
          <Floaty className="blob right-8 bottom-2 h-24 w-24 bg-lime/40" />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-white/70">
                  {complet
                    ? "Complet"
                    : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}
                </p>
                <h1 className="mt-1.5 font-display text-[30px] leading-[1.1] text-white">
                  {s.titre}
                </h1>
              </div>
              <div className="date-badge">
                <span className="font-display text-lg font-extrabold text-ink">
                  {dayNumber(s.date_heure)}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted">
                  {monthShort(s.date_heure)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-white/90">
              <p className="meta-row">
                <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                <span className="capitalize">{formatDateLong(s.date_heure)}</span>
              </p>
              {s.duree > 0 && (
                <p className="meta-row">
                  <Clock className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                  Durée&nbsp;: {formatDuree(s.duree)}
                </p>
              )}
              <p className="meta-row">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                {s.lieu}
              </p>
              <p className="meta-row">
                <Users className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                {s.capacite} places au total
              </p>
            </div>

            <div className="mt-6 border-t border-white/20 pt-4">
              <span className="font-display text-3xl font-extrabold text-white">
                {formatEUR(s.prix_cents)}
              </span>
              <span className="ml-1 text-sm text-white/70">/ place</span>
            </div>
          </div>
        </div>
      </Reveal>

      {s.description && (
        <Reveal delay={0.1} className="mt-5">
          <div className="card">
            <h2 className="font-display text-xl">À propos de l&apos;atelier</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
              {s.description}
            </p>
          </div>
        </Reveal>
      )}

      {complet ? (
        <Reveal delay={0.1} className="mt-5">
          <div className="card text-center">
            <p className="font-display text-lg">Cet atelier est complet 😢</p>
            <p className="mt-1 text-muted">
              Reviens bientôt&nbsp;: de nouvelles dates arrivent.
            </p>
            <Link href="/" className="btn-ghost mt-4 inline-flex">
              Voir les autres ateliers
            </Link>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.1} className="mt-5">
          <ReserveForm sessionId={s.id} max={restantes} prixCents={s.prix_cents} />
        </Reveal>
      )}
    </main>
  );
}

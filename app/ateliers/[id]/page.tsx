import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { formatDateLong, dayNumber, monthShort, formatDuree, capitalizeFirst } from "@/lib/ui";
import { Reveal, Floaty } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ShareButton } from "@/components/ShareButton";
import { StatChip } from "@/components/StatChip";
import { AboutCollapse } from "@/components/AboutCollapse";

export const dynamic = "force-dynamic";

export default async function AtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <main className="screen pb-28">
      {/* Hero moitié-haute */}
      <div className="hero-band !pb-0">
        <div className="relative -mx-4 h-64 overflow-hidden rounded-b-[2rem]">
          {s.image_url ? (
            <Image src={s.image_url} alt={s.titre} fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 tone-brand">
              <Floaty className="blob -right-12 -top-14 h-48 w-48 bg-white/25" />
              <Floaty className="blob -bottom-16 -left-12 h-44 w-44 bg-magenta/30" />
              <Floaty className="blob right-8 bottom-2 h-24 w-24 bg-lime/40" />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <CircleButton as="link" href="/" label="Retour à l'accueil">
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </CircleButton>
            <ShareButton title={s.titre} />
          </div>
        </div>
      </div>

      {/* Feuille de contenu */}
      <Reveal className="sheet">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-brand-ink">
              {complet ? "Complet" : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}
            </p>
            <h1 className="mt-1 font-display text-[28px] leading-[1.1]">{s.titre}</h1>
            <p className="mt-1.5 text-muted">{capitalizeFirst(formatDateLong(s.date_heure))}</p>
          </div>
          <div className="date-badge h-14 w-14">
            <span className="font-display text-xl font-extrabold text-ink">{dayNumber(s.date_heure)}</span>
            <span className="text-[10px] font-bold uppercase text-muted">{monthShort(s.date_heure)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <StatChip icon={Users} label="places" value={complet ? "0" : String(restantes)} />
          <StatChip icon={Clock} label="durée" value={s.duree ? formatDuree(s.duree) : "—"} />
          <StatChip icon={MapPin} label="lieu" value={s.lieu} />
        </div>

        {s.description && (
          <div className="mt-6">
            <h2 className="font-display text-xl">À propos de l&apos;atelier</h2>
            <AboutCollapse text={s.description} />
          </div>
        )}
      </Reveal>

      {/* CTA collant */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur">
        <div className="screen py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {complet ? (
            <Link href="/" className="btn-ghost w-full">Voir les autres ateliers</Link>
          ) : (
            <Link href={`/ateliers/${s.id}/reserver`} className="btn-primary h-14 w-full justify-between">
              <span className="min-w-0 flex-1 truncate text-left">Réserver — {formatEUR(s.prix_cents)} / place</span>
              <span className="arrow-fab shrink-0 h-10 w-10 bg-white text-ink">
                <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

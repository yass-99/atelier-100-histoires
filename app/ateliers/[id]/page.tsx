import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { formatDateLong, formatDuree, capitalizeFirst } from "@/lib/ui";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-0.5 font-bold text-foreground">{value}</p>
    </div>
  );
}

export default async function AtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <main className="screen pb-28">
      {/* Hero : image ou aplat de couleur uni (aucun décor) */}
      <div className="relative -mx-4 h-56 overflow-hidden rounded-b-[2rem]">
        {s.image_url ? (
          <Image src={s.image_url} alt={s.titre} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 tone-brand" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <CircleButton as="link" href="/" label="Retour à l'accueil">
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </CircleButton>
          <ShareButton title={s.titre} />
        </div>
      </div>

      {/* Feuille de contenu */}
      <Reveal className="sheet">
        <p className="eyebrow text-muted">
          {complet ? "Complet" : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}
        </p>
        <h1 className="mt-1 font-display text-[28px] leading-[1.1]">{s.titre}</h1>
        <p className="mt-2 font-bold text-foreground">{capitalizeFirst(formatDateLong(s.date_heure))}</p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <Meta label="Lieu" value={s.lieu} />
          <Meta label="Durée" value={s.duree ? formatDuree(s.duree) : "—"} />
          <Meta label="Places" value={complet ? "0" : String(restantes)} />
        </div>

        {s.description && (
          <div className="mt-8">
            <h2 className="font-display text-xl">À propos de l&apos;atelier</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">{s.description}</p>
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

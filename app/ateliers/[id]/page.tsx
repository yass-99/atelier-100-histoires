import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Hourglass,
  Users,
  Banknote,
} from "lucide-react";
import { getSession } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { formatDateLong, formatDateShort, formatHeure, formatDuree, capitalizeFirst } from "@/lib/ui";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
        <Icon className="h-4 w-4 text-ink" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</dt>
        <dd className="font-display text-sm font-extrabold">{value}</dd>
      </div>
    </div>
  );
}

export default async function AtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const complet = restantes <= 0;
  const heure = formatHeure(s.date_heure);

  return (
    <main className="screen">
      {/* Nav flottante (remplace le header) : back + partage, sticky en haut */}
      <div className="fixed inset-x-0 top-0 z-30">
        <div className="screen flex items-center justify-between pt-[calc(2.25rem+env(safe-area-inset-top))] pb-2">
          <CircleButton as="link" href="/" label="Retour à l'accueil">
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </CircleButton>
          <ShareButton title={s.titre} />
        </div>
      </div>

      {/* Hero : image ou aplat de couleur uni */}
      <div className="relative -mx-4 h-56 overflow-hidden rounded-b-[2rem] border-b-[1.5px] border-ink">
        {s.image_url ? (
          <Image src={s.image_url} alt={s.titre} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 tone-brand" />
        )}
      </div>

      {/* Feuille de contenu — remonte jusqu'en bas de l'écran (pas de coupure nette) */}
      <Reveal className="sheet min-h-[calc(100dvh-16rem)] pb-28">
        {complet ? (
          <span className="badge bg-danger text-white">Complet</span>
        ) : (
          <span className="chip bg-amber-soft text-ink">
            {restantes} place{restantes > 1 ? "s" : ""} restante{restantes > 1 ? "s" : ""}
          </span>
        )}

        <h1 className="mt-3 font-display text-[30px] leading-[1.08]">{s.titre}</h1>
        <p className="mt-2 font-bold text-foreground">
          {capitalizeFirst(formatDateLong(s.date_heure))}
        </p>

        {/* Carte infos (contour noir) */}
        <div className="card mt-6">
          <dl className="grid grid-cols-2 gap-4">
            <Info icon={CalendarDays} label="Date" value={capitalizeFirst(formatDateShort(s.date_heure))} />
            <Info icon={Clock} label="Heure" value={heure} />
            <Info icon={MapPin} label="Lieu" value={s.lieu} />
            <Info icon={Hourglass} label="Durée" value={s.duree ? formatDuree(s.duree) : "—"} />
            <Info icon={Users} label="Places" value={complet ? "0" : String(restantes)} />
            <Info icon={Banknote} label="Prix" value={`${formatEUR(s.prix_cents)} / place`} />
          </dl>
        </div>

        {s.description && (
          <div className="mt-8">
            <h2 className="font-display text-xl">À propos de l&apos;atelier</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
              {s.description}
            </p>
          </div>
        )}
      </Reveal>

      {/* CTA collant */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="screen py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {complet ? (
            <Link href="/" className="btn-outline w-full">
              Voir les autres ateliers
            </Link>
          ) : (
            <Link
              href={`/ateliers/${s.id}/reserver`}
              className="btn-primary h-14 w-full justify-between"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                Réserver — {formatEUR(s.prix_cents)} / place
              </span>
              <span className="arrow-fab h-10 w-10 shrink-0 bg-surface text-ink">
                <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

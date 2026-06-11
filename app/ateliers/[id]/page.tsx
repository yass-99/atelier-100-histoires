import Link from "next/link";
import { ViewTransition } from "react";
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
  UsersRound,
  Coffee,
} from "lucide-react";
import { getSession } from "@/lib/sessions";
import { getMyDiscount } from "@/lib/leads";
import { placesRestantes, publicCibleLabel } from "@/lib/sessions.shared";
import { formatEUR, discountedCents } from "@/lib/money";
import { formatDateLong, formatDateShort, formatHeure, formatDuree, capitalizeFirst } from "@/lib/ui";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ShareButton } from "@/components/ShareButton";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { PrivateAtelierBlock } from "@/components/PrivateAtelierBlock";

export const dynamic = "force-dynamic";

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: React.ReactNode;
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
  const photos = s.image_urls?.length ? s.image_urls : s.image_url ? [s.image_url] : [];
  const pct = await getMyDiscount();
  const prixReduit = pct ? discountedCents(s.prix_cents, pct) : null;

  return (
    <main className="screen">
      {/* Nav flottante (remplace le header) : back + partage, sticky en haut */}
      <div className="fixed inset-x-0 top-0 z-30">
        <div className="screen flex items-center justify-between pt-[calc(2.25rem+env(safe-area-inset-top))] pb-2">
          <CircleButton as="link" href="/" label="Retour à l'accueil" transitionTypes={["nav-back"]}>
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </CircleButton>
          <ShareButton title={s.titre} />
        </div>
      </div>

      {/* Hero : image ou aplat. Cible du morph depuis la carte « À la une ». */}
      <ViewTransition name={`atelier-photo-${s.id}`} share="morph">
        <div className="relative -mx-4 h-56 overflow-hidden rounded-b-[2rem] border-b-[1.5px] border-ink">
          {photos.length > 0 ? (
            <PhotoCarousel images={photos} alt={s.titre} />
          ) : (
            <div className="absolute inset-0 tone-brand" />
          )}
        </div>
      </ViewTransition>

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
            <Info
              icon={Banknote}
              label="Prix"
              value={
                prixReduit !== null ? (
                  <span className="tabular-nums">
                    <span className="font-semibold text-muted line-through">
                      {formatEUR(s.prix_cents)}
                    </span>{" "}
                    <span className="text-success">{formatEUR(prixReduit)}</span> / place
                  </span>
                ) : (
                  `${formatEUR(s.prix_cents)} / place`
                )
              }
            />
            <Info
              icon={UsersRound}
              label="Public"
              value={publicCibleLabel(s.public_cible, s.age_minimum)}
            />
            {s.conso_incluse && (
              <Info
                icon={Coffee}
                label="Sur place"
                value={s.conso_detail || "Consommation incluse"}
              />
            )}
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

        <PrivateAtelierBlock />
      </Reveal>

      {/* CTA collant */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="screen py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {complet ? (
            <Link href="/" transitionTypes={["nav-back"]} className="btn-outline w-full">
              Voir les autres ateliers
            </Link>
          ) : (
            <Link
              href={`/ateliers/${s.id}/reserver`}
              transitionTypes={["nav-forward"]}
              className="btn-primary h-14 w-full justify-between"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {prixReduit !== null ? (
                  <span className="tabular-nums">
                    Réserver —{" "}
                    <span className="font-semibold text-on-ink/55 line-through">
                      {formatEUR(s.prix_cents)}
                    </span>{" "}
                    {formatEUR(prixReduit)} / place
                  </span>
                ) : (
                  <>Réserver — {formatEUR(s.prix_cents)} / place</>
                )}
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

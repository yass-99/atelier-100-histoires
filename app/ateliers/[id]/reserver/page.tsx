import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/sessions";
import { getMyDiscount } from "@/lib/leads";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR, discountedCents } from "@/lib/money";
import { formatDateLong, capitalizeFirst, stubToneForIndex } from "@/lib/ui";
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

  // Tonalité dérivée de l'id (variée d'un atelier à l'autre, stable au rechargement).
  const toneIdx = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const tone = stubToneForIndex(toneIdx);

  // Si connecté : pré-remplit l'email avec celui du compte.
  const user = await currentUser();
  const defaultEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  // Remise mystère du compte connecté (seule source honorée au paiement).
  const pct = await getMyDiscount();
  const prixReduit = pct ? discountedCents(s.prix_cents, pct) : null;

  return (
    <main className="screen pb-12 pt-[calc(6rem+env(safe-area-inset-top))]">
      {/* Nav flottante : back sticky en haut (remplace le header) */}
      <div className="fixed inset-x-0 top-0 z-30">
        <div className="screen flex items-center pt-[calc(2.25rem+env(safe-area-inset-top))] pb-2">
          <CircleButton as="link" href={`/ateliers/${s.id}`} label="Retour à l'atelier" transitionTypes={["nav-back"]}>
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </CircleButton>
        </div>
      </div>

      <h1 className="text-center font-display text-2xl">Réserver ma place</h1>

      {/* Ticket en 3 sections : bordures côté par côté, AUCUNE sur la bande de
          perforation → les encoches restent ouvertes (leur arc fait le contour). */}
      <Reveal className="mt-6 drop-shadow-[0_14px_36px_rgba(18,19,23,0.12)]">
        {/* 1 — Talon récap (coloré) : bord haut + gauche + droite */}
        <div className={`rounded-t-card border-[1.5px] border-b-0 border-ink p-5 ${tone}`}>
          <p className="eyebrow text-foreground/60">Atelier aux 100 histoires</p>
          <h2 className="mt-1 font-display text-xl leading-tight">{s.titre}</h2>
          <p className="mt-1.5 font-bold">{capitalizeFirst(formatDateLong(s.date_heure))}</p>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/60">
              Prix par place
            </span>
            {prixReduit !== null ? (
              <span className="flex items-baseline gap-2 tabular-nums">
                <span className="font-display text-lg font-black text-foreground/45 line-through">
                  {formatEUR(s.prix_cents)}
                </span>
                <span className="font-display text-3xl font-black">{formatEUR(prixReduit)}</span>
              </span>
            ) : (
              <span className="font-display text-3xl font-black tabular-nums">
                {formatEUR(s.prix_cents)}
              </span>
            )}
          </div>
        </div>

        {/* 2 — Bande de perforation : pas de bordure latérale, encoches ouvertes */}
        <div className="relative h-6 overflow-hidden">
          <div className="absolute inset-x-7 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-ink/40" />
          <span className="absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-background" aria-hidden />
          <span className="absolute left-full top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-background" aria-hidden />
        </div>

        {/* 3 — Partie détachable : formulaire (bord gauche + droite + bas) */}
        <div className="overflow-hidden rounded-b-card border-[1.5px] border-t-0 border-ink bg-surface">
          <ReserveForm sessionId={s.id} max={restantes} prixCents={s.prix_cents} defaultEmail={defaultEmail} pct={pct} />
        </div>
      </Reveal>
    </main>
  );
}

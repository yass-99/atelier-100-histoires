import type { Metadata } from "next";
import { CalendarHeart } from "lucide-react";
import { listPublishedSessions } from "@/lib/sessions";
import { getMyDiscount } from "@/lib/leads";
import { SessionsBoard } from "@/components/SessionsBoard";
import { CreeTonAtelierCta } from "@/components/CreeTonAtelierCta";
import { Reveal } from "@/components/motion";

// Pas de cache : données fraîches à chaque visite.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tous nos ateliers créatifs — l'agenda complet",
  description:
    "Tous les ateliers créatifs à venir en Île-de-France : bijoux et plus encore. Choisis ta date et réserve ta place.",
};

export default async function AteliersPage() {
  const sessions = await listPublishedSessions();
  const pct = await getMyDiscount();

  return (
    <main className="screen py-6">
      <div>
        <p className="eyebrow text-muted">L&apos;agenda complet</p>
        <h1 className="mt-1 font-display text-2xl">Tous nos ateliers</h1>
      </div>

      {sessions.length === 0 ? (
        <Reveal>
          <div className="card mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <CalendarHeart className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <p className="font-display text-xl">Aucun atelier programmé</p>
            <p className="text-muted">De nouvelles dates arrivent très bientôt. Reviens vite&nbsp;!</p>
          </div>
          <div className="mt-4">
            <CreeTonAtelierCta from="ateliers_empty" />
          </div>
        </Reveal>
      ) : (
        <SessionsBoard sessions={sessions} pct={pct} step={6} />
      )}
    </main>
  );
}

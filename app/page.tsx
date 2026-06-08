import { CalendarHeart } from "lucide-react";
import { listPublishedSessions } from "@/lib/sessions";
import { SessionsBoard } from "@/components/SessionsBoard";
import { Promesse } from "@/components/Promesse";
import { Faq } from "@/components/Faq";
import { RestePrevenu } from "@/components/RestePrevenu";
import { Reveal } from "@/components/motion";

// Pas de cache : données fraîches à chaque visite.
export const dynamic = "force-dynamic";

export default async function Home() {
  const sessions = await listPublishedSessions();

  return (
    <main className="screen space-y-12 py-8">
      {/* En-tête centré, éditorial */}
      <Reveal className="text-center">
        <p className="eyebrow text-muted">Ateliers d&apos;écriture &amp; de récit</p>
        <h1 className="mt-2 font-display text-[40px] leading-[1.04]">
          Trouve ton prochain atelier
        </h1>
        <p className="mt-3 text-lg text-muted">
          Petites histoires. Grandes rencontres.
        </p>
      </Reveal>

      {sessions.length === 0 ? (
        <Reveal>
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <CalendarHeart className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <p className="font-display text-xl">Aucun atelier programmé</p>
            <p className="text-muted">De nouvelles dates arrivent très bientôt. Reviens vite&nbsp;!</p>
          </div>
        </Reveal>
      ) : (
        <SessionsBoard sessions={sessions} />
      )}

      <Reveal>
        <Promesse />
      </Reveal>

      <Reveal>
        <Faq />
      </Reveal>

      <Reveal>
        <RestePrevenu />
      </Reveal>
    </main>
  );
}

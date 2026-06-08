import { Sparkles, Ticket, PenLine, CalendarHeart } from "lucide-react";
import { listPublishedSessions } from "@/lib/sessions";
import { FeaturedSession } from "@/components/FeaturedSession";
import { SessionRow } from "@/components/SessionRow";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Sparkles, tone: "tone-lime", title: "Choisis ton atelier", text: "Parcours les séances à venir et trouve celle qui t'inspire." },
  { icon: Ticket, tone: "tone-amber", title: "Réserve en ligne", text: "Paiement sécurisé en quelques secondes. Place garantie." },
  { icon: PenLine, tone: "tone-lavender", title: "Viens écrire", text: "Rejoins le groupe et laisse parler ton imagination." },
];

export default async function Home() {
  const sessions = await listPublishedSessions();
  const [featured, ...rest] = sessions;

  return (
    <main className="screen py-8">
      <Reveal>
        <p className="eyebrow text-brand-ink">Ateliers d&apos;écriture &amp; de récit</p>
        <h1 className="mt-2 font-display text-[40px] leading-[1.04]">
          Trouve ton prochain <span className="text-brand-ink">atelier</span>
        </h1>
        <p className="mt-3 text-lg text-muted">
          Petites histoires. Grandes rencontres.
        </p>
      </Reveal>

      {sessions.length === 0 ? (
        <Reveal className="mt-8">
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <CalendarHeart className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <p className="font-display text-xl">Aucun atelier programmé</p>
            <p className="text-muted">De nouvelles dates arrivent très bientôt. Reviens vite&nbsp;!</p>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.05} className="mt-7">
            <FeaturedSession s={featured} />
          </Reveal>

          {rest.length > 0 && (
            <section className="mt-9">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl">À venir</h2>
                <span className="badge bg-ink text-on-ink">{rest.length}</span>
              </div>
              <Stagger className="space-y-3.5">
                {rest.map((s, i) => (
                  <StaggerItem key={s.id}>
                    <SessionRow s={s} index={i + 1} />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}
        </>
      )}

      {/* Comment ça marche */}
      <Reveal className="mt-12">
        <h2 className="mb-4 font-display text-2xl">Comment ça marche</h2>
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`flex items-center gap-4 rounded-card ${step.tone} p-4 shadow-soft`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-on-ink">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-extrabold">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-sm opacity-80">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </main>
  );
}

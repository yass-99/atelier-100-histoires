import { listPublishedSessions } from "@/lib/sessions";
import { FeaturedSession } from "@/components/FeaturedSession";
import { SessionRow } from "@/components/SessionRow";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sessions = await listPublishedSessions();
  const [featured, ...rest] = sessions;

  return (
    <main className="screen py-8">
      <span className="chip bg-magenta-soft text-ink">Atelier des 100 histoires</span>
      <h1 className="mt-3 text-3xl leading-tight">Réservez votre prochain atelier</h1>
      <p className="mt-2 text-muted">Petites histoires. Grandes rencontres.</p>

      {sessions.length === 0 ? (
        <p className="mt-6 text-muted">Aucun atelier programmé pour le moment.</p>
      ) : (
        <>
          <div className="mt-6">
            <FeaturedSession s={featured} />
          </div>
          {rest.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-xl">À venir</h2>
              <div className="space-y-3">
                {rest.map((s) => (
                  <SessionRow key={s.id} s={s} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

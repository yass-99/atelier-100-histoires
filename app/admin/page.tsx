import { listAllSessions } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { capitalizeFirst, formatDateLong, formatDuree } from "@/lib/ui";
import type { Session } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { setSessionStatus, setSessionFeatured, deleteSession } from "./actions";
import { AtelierForm } from "./AtelierForm";

export const dynamic = "force-dynamic";

const STATUT_STYLE: Record<string, string> = {
  publie: "bg-mint-soft text-ink",
  brouillon: "bg-amber-soft text-ink",
  annule: "bg-danger text-white",
};
const STATUT_LABEL: Record<string, string> = {
  publie: "Publié",
  brouillon: "Brouillon",
  annule: "Annulé",
};

function Row({ s }: { s: Session }) {
  const restantes = placesRestantes(s);
  return (
    <article className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg leading-tight">{s.titre}</h3>
          <p className="mt-1 text-sm text-muted">
            {capitalizeFirst(formatDateLong(s.date_heure))} · {formatDuree(s.duree)} · {s.lieu || "—"}
          </p>
          <p className="mt-1 text-sm font-bold">
            {formatEUR(s.prix_cents)} · {restantes}/{s.capacite} place{s.capacite > 1 ? "s" : ""} libre{restantes > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`badge ${STATUT_STYLE[s.statut] ?? "bg-background text-ink"}`}>
            {STATUT_LABEL[s.statut] ?? s.statut}
          </span>
          {s.a_la_une && (
            <span className="badge bg-amber text-ink">
              <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden /> À la une
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={setSessionStatus.bind(null, s.id, s.statut === "publie" ? "brouillon" : "publie")}>
          <button className="btn-outline min-h-10 px-4 py-2 text-sm">
            {s.statut === "publie" ? "Dépublier" : "Publier"}
          </button>
        </form>
        <form action={setSessionFeatured.bind(null, s.id, !s.a_la_une)}>
          <button className="btn-outline min-h-10 px-4 py-2 text-sm">
            {s.a_la_une ? "Retirer de la une" : "Mettre à la une"}
          </button>
        </form>
        {s.statut !== "annule" && (
          <form action={setSessionStatus.bind(null, s.id, "annule")}>
            <button className="btn-ghost min-h-10 px-4 py-2 text-sm">Annuler</button>
          </form>
        )}
        <form action={deleteSession.bind(null, s.id)}>
          <button className="btn-ghost min-h-10 px-4 py-2 text-sm text-danger">Supprimer</button>
        </form>
      </div>
    </article>
  );
}

export default async function AdminPage() {
  const sessions = await listAllSessions();

  return (
    <main className="screen space-y-8 py-8">
      <header>
        <p className="eyebrow text-muted">Back-office</p>
        <h1 className="mt-2 font-display text-[34px] leading-[1.05]">Ateliers</h1>
      </header>

      <section>
        <h2 className="mb-3 font-display text-xl">Nouvel atelier</h2>
        <AtelierForm />
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">Tous les ateliers ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="text-muted">Aucun atelier pour l&apos;instant.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

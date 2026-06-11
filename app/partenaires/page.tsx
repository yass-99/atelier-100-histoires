import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, ExternalLink, Store } from "lucide-react";
import { listLieuxPartenaires, type LieuPartenaire } from "@/lib/lieux-partenaires";
import { listPublishedSessions } from "@/lib/sessions";
import { TYPES_LIEU, type TypeLieu } from "@/lib/partenaire.shared";
import { LieuIcon } from "@/components/LieuIcon";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Nos lieux partenaires — boulangeries, cafés et restos qui nous accueillent",
  description:
    "Nos ateliers créatifs prennent vie dans des boulangeries, cafés et restaurants indépendants près de chez vous. Découvrez les lieux qui nous accueillent.",
};

// Lecture directe en base : données fraîches à chaque visite.
export const dynamic = "force-dynamic";

const TYPE_LABEL = (t: TypeLieu) => TYPES_LIEU.find((x) => x.value === t)?.label ?? t;

/** Aplat doux par type de lieu (icône + chip) — aucun dégradé. */
const SOFT: Record<TypeLieu, string> = {
  boulangerie: "bg-brand-soft",
  restaurant: "bg-magenta-soft",
  cafe: "bg-amber-soft",
  bistrot: "bg-mint-soft",
  patisserie: "bg-lavender",
  autre: "bg-surface",
};

export default async function PartenairesPage() {
  const [partenaires, sessions] = await Promise.all([
    // Si la table n'existe pas encore (migration non exécutée) → état vide propre.
    listLieuxPartenaires().catch((e) => {
      console.error("Lecture lieux_partenaires :", e);
      return [] as LieuPartenaire[];
    }),
    listPublishedSessions(),
  ]);

  // Nombre d'ateliers publiés par lieu (match sur le nom, insensible à la casse).
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = (s.lieu ?? "").trim().toLowerCase();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const atelierCount = (nom: string) => counts.get(nom.trim().toLowerCase()) ?? 0;

  const quartiers = new Set(partenaires.map((p) => p.ville.trim().toLowerCase())).size;

  return (
    <main className="screen space-y-6 py-8">
      <Reveal>
        <p className="eyebrow text-muted">Ils nous accueillent</p>
        <h1 className="mt-1 font-display text-3xl leading-tight">Des lieux qui ont du goût</h1>
        <p className="mt-2 text-muted">
          Nos ateliers prennent vie dans des boulangeries, cafés et restos indépendants près de
          chez vous. On crée ensemble, on repart avec sa création — et souvent une conso offerte.
        </p>
        {partenaires.length > 0 && (
          <span className="chip mt-4 border-[1.5px] border-ink bg-amber-soft">
            <Store className="h-4 w-4 text-ink" strokeWidth={2} aria-hidden />
            {partenaires.length} lieu{partenaires.length > 1 ? "x" : ""} partenaire
            {partenaires.length > 1 ? "s" : ""}
            {quartiers > 1 ? ` · ${quartiers} quartiers` : ""}
          </span>
        )}
      </Reveal>

      {partenaires.length === 0 ? (
        <Reveal>
          <div className="card text-center">
            <p className="font-display text-xl">Nos lieux arrivent bientôt</p>
            <p className="mt-2 text-muted">Nous dévoilons très vite les endroits qui nous accueillent.</p>
          </div>
        </Reveal>
      ) : (
        <ul className="space-y-4">
          {partenaires.map((p, i) => {
            const n = atelierCount(p.nom);
            return (
              <Reveal key={p.id} delay={i * 0.04}>
                <li className="card">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-ink ${SOFT[p.type_lieu]}`}
                    >
                      <LieuIcon type={p.type_lieu} className="h-6 w-6 text-ink" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-extrabold leading-tight">{p.nom}</h2>
                      <span className={`chip mt-1 ${SOFT[p.type_lieu]} text-foreground`}>
                        {TYPE_LABEL(p.type_lieu)}
                      </span>
                    </div>
                  </div>

                  <p className="meta-row mt-3 text-muted">
                    <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
                    {p.ville}
                  </p>

                  {p.pitch && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.pitch}</p>}

                  <div className="mt-4 flex items-center justify-between gap-3 border-t-[1.5px] border-border pt-3">
                    <span className="font-display text-sm font-extrabold text-foreground">
                      {n > 0 ? `${n} atelier${n > 1 ? "s" : ""} ici` : "Bientôt des ateliers"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/ateliers"
                        className="inline-flex items-center gap-1.5 font-display text-sm font-extrabold text-brand-ink"
                      >
                        Voir les ateliers
                        <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                      </Link>
                      {p.lien && (
                        <a
                          href={p.lien}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Visiter ${p.nom} (nouvel onglet)`}
                          className="circle-btn h-9 w-9"
                        >
                          <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      )}

      {/* CTA : attirer de nouveaux lieux → formulaire dédié. */}
      <Reveal>
        <div className="rounded-card border-[1.5px] border-ink bg-brand p-6 text-center text-white">
          <h2 className="font-display text-xl font-extrabold">Vous tenez un lieu chaleureux&nbsp;?</h2>
          <p className="mt-1.5 text-sm text-white/90">
            Accueillez nos ateliers et faites venir une nouvelle clientèle créative chez vous.
          </p>
          <Link
            href="/devenir-partenaire"
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-surface px-5 py-3 font-bold text-ink transition active:scale-[.97]"
          >
            Devenir lieu partenaire
            <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </Reveal>
    </main>
  );
}

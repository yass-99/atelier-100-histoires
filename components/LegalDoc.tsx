import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { CircleButton } from "./CircleButton";
import { Reveal } from "./motion";

/**
 * Page légale habillée comme un e-billet : talon bleu royal (aplat `bg-brand`)
 * avec micro-label + titre + champs, ligne de déchirure perforée (`.perf-notch`),
 * puis corps sur surface claire — texte foncé pour rester parfaitement lisible.
 * Reprend la DA du composant Ticket (cf. components/Ticket.tsx).
 */
export function LegalDoc({
  title,
  updated,
  meta,
  children,
}: {
  title: string;
  updated: string;
  meta?: { label: string; value: ReactNode }[];
  children: ReactNode;
}) {
  return (
    <main className="screen py-6 pb-16">
      <div className="mb-5 flex items-center gap-3">
        <CircleButton as="link" href="/" label="Retour à l'accueil" transitionTypes={["nav-back"]}>
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </CircleButton>
        <p className="eyebrow text-muted">Informations légales</p>
      </div>

      <Reveal>
        <article className="relative overflow-hidden rounded-card border-[1.5px] border-ink bg-surface shadow-card">
          {/* Talon — aplat bleu royal, comme l'e-billet */}
          <header className="bg-brand p-6 text-white">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
              L&apos;Atelier aux 100 histoires
            </p>
            <h1 className="mt-1 font-display text-[26px] leading-tight">{title}</h1>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {meta?.map((m) => (
                <div key={m.label}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">
                    {m.label}
                  </p>
                  <p className="mt-0.5 font-display text-sm font-extrabold">{m.value}</p>
                </div>
              ))}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">
                  Mise à jour
                </p>
                <p className="mt-0.5 font-display text-sm font-extrabold">{updated}</p>
              </div>
            </div>
          </header>

          {/* Ligne de déchirure : tirets + encoches crème bordées (effet ticket) */}
          <div className="relative h-0" aria-hidden>
            <span className="perf-notch left-0 top-0 -translate-y-1/2" />
            <span className="perf-notch right-0 top-0 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-x-6 top-0 border-t-2 border-dashed border-ink/15" />
          </div>

          {/* Corps — texte foncé lisible sur surface claire */}
          <div className="space-y-7 px-6 pb-7 pt-9 text-[15px] leading-relaxed text-foreground/90">
            {children}
          </div>
        </article>
      </Reveal>
    </main>
  );
}

/** Section du corps : titre éditorial + contenu. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg text-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/** Grille de définitions (label majuscule + valeur), façon champs de billet. */
export function LegalDefs({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-muted">{it.label}</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Encadré d'accent (point important : rétractation, remboursement…). */
export function LegalNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-brand-soft px-4 py-3 text-[14px] text-foreground">
      {children}
    </div>
  );
}

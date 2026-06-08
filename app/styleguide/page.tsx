import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide — Atelier aux 100 histoires",
};

const COLORS: { name: string; varName: string; text?: string }[] = [
  { name: "background", varName: "--color-background" },
  { name: "lavender", varName: "--color-lavender" },
  { name: "surface", varName: "--color-surface" },
  { name: "ink", varName: "--color-ink", text: "#fff" },
  { name: "brand", varName: "--color-brand", text: "#111" },
  { name: "brand-soft", varName: "--color-brand-soft" },
  { name: "magenta", varName: "--color-magenta", text: "#fff" },
  { name: "magenta-soft", varName: "--color-magenta-soft" },
  { name: "amber", varName: "--color-amber" },
  { name: "orange", varName: "--color-orange", text: "#fff" },
  { name: "success", varName: "--color-success", text: "#fff" },
  { name: "danger", varName: "--color-danger", text: "#fff" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="screen py-8">
      <p className="chip bg-brand-soft text-ink">Design system</p>
      <h1 className="mt-3 text-3xl leading-tight">
        Atelier aux 100 histoires
      </h1>
      <p className="mt-2 text-muted">
        Aperçu des tokens et composants réutilisables. Mobile-first.
      </p>

      <Section title="Couleurs">
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <div key={c.name}>
              <div
                className="h-16 rounded-lg border border-border flex items-end p-2 text-xs font-medium"
                style={{ background: `var(${c.varName})`, color: c.text ?? "#111114" }}
              >
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <div className="card space-y-2">
          <h1 className="text-3xl">Titre display — Nunito 800</h1>
          <h2 className="text-2xl">Sous-titre — Nunito 800</h2>
          <p className="text-base">
            Corps de texte en DM Sans. Petites leçons. Grandes victoires.
            Zéro pression.
          </p>
          <p className="text-sm text-muted">
            Texte secondaire / légende en gris atténué.
          </p>
        </div>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">Réserver</button>
          <button className="btn-brand">Voir l’atelier</button>
          <button className="btn-accent">Payer maintenant</button>
          <button className="btn-ghost">Annuler</button>
          <button className="btn-primary" disabled>
            Désactivé
          </button>
        </div>
      </Section>

      <Section title="Pastilles & badges">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-brand-soft text-ink">Samedi 14h</span>
          <span className="chip bg-magenta-soft text-ink">Écriture</span>
          <span className="chip bg-amber/20 text-ink">3 places restantes</span>
          <span className="badge bg-success text-white">Confirmé</span>
          <span className="badge bg-danger text-white">Complet</span>
        </div>
      </Section>

      <Section title="Carte atelier (exemple)">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="chip bg-magenta-soft text-ink">Écriture</span>
              <h3 className="mt-2 text-xl">Écrire sa première histoire</h3>
              <p className="text-sm text-muted">Samedi 15 juil. · 14h00 · Paris 11e</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">35€</p>
              <p className="text-xs text-muted">par place</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="chip bg-brand-soft text-ink">4 places restantes</span>
            <button className="btn-primary">Réserver</button>
          </div>
        </article>
      </Section>

      <Section title="Rayons & ombres">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-md shadow-soft p-4 text-sm">rounded-md · shadow-soft</div>
          <div className="bg-surface rounded-lg shadow-soft p-4 text-sm">rounded-lg · shadow-soft</div>
          <div className="bg-surface rounded-card shadow-card p-4 text-sm">rounded-card · shadow-card</div>
          <div className="bg-ink text-on-ink rounded-pill shadow-pop p-4 text-sm">rounded-pill · shadow-pop</div>
        </div>
      </Section>

      <Section title="Ticket & jours">
        {/* E-ticket */}
        <div className="ticket mx-auto max-w-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Atelier aux 100 histoires</p>
          <h3 className="mt-1 text-xl font-extrabold">Écrire sa première histoire</h3>
          <p className="mt-0.5 text-sm text-white/80">Samedi 15 juil. · 14h00 · Paris 11e</p>

          {/* Ligne de perforation */}
          <div className="ticket-perf">
            <span className="ticket-notch ticket-notch-left" />
            <span className="ticket-notch ticket-notch-right" />
          </div>

          {/* Zone QR (placeholder) */}
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Réf. billet</p>
              <p className="font-bold">#A100-2025</p>
            </div>
            <div className="h-16 w-16 rounded-xl bg-white/20" aria-label="QR code placeholder" />
          </div>
        </div>

        {/* Strip de jours */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          <button className="day-pill" type="button">
            <span className="text-xs text-muted">sam.</span>
            <span className="text-lg font-extrabold">14</span>
          </button>
          <button className="day-pill" data-active="true" type="button">
            <span className="text-xs">dim.</span>
            <span className="text-lg font-extrabold">15</span>
          </button>
          <button className="day-pill" type="button">
            <span className="text-xs text-muted">lun.</span>
            <span className="text-lg font-extrabold">16</span>
          </button>
        </div>
      </Section>
    </main>
  );
}

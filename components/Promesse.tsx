import { Users, Sparkle, PenLine } from "lucide-react";

const POINTS = [
  { icon: Users, text: "Petits groupes, ambiance bienveillante" },
  { icon: Sparkle, text: "Tous niveaux — débutant·e bienvenu·e" },
  { icon: PenLine, text: "Tu repars avec un texte bien à toi" },
];

export function Promesse() {
  return (
    <section className="rounded-card tone-brand p-6 shadow-lift">
      <p className="eyebrow text-white/70">La promesse</p>
      <h2 className="mt-2 font-display text-[28px] leading-[1.1] text-white">
        Écrire, ensemble, sans pression.
      </h2>
      <ul className="mt-5 space-y-3">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-white/90">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-medium">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

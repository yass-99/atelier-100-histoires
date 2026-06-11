import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { Eye, Users, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PartenaireForm } from "./partenaire-form";

export const metadata: Metadata = {
  title: "Devenir lieu partenaire — accueillez nos ateliers créatifs",
  description:
    "Boulangerie, café, restaurant, bistrot : accueillez nos ateliers créatifs et faites venir une nouvelle clientèle un soir creux. On apporte le matériel et l'animation, vous n'avez rien à gérer. Réponse sous 48 h.",
};

const POINTS = [
  { icon: Eye, text: "De la visibilité auprès de notre communauté créative" },
  { icon: Users, text: "De nouveaux clients qui consomment sur place" },
  { icon: Sparkles, text: "Zéro logistique : on apporte le matériel et l'animation" },
];

export default async function DevenirPartenairePage() {
  const user = await currentUser();
  const defaultEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <main className="screen py-8">
      <h1 className="text-center font-display text-2xl">Devenir lieu partenaire</h1>

      {/* Ticket en 3 sections (même structure que « Crée ton atelier ») :
          talon coloré, bande de perforation aux encoches ouvertes, puis le
          formulaire comme partie détachable. */}
      <Reveal className="mt-6 drop-shadow-[0_14px_36px_rgba(18,19,23,0.12)]">
        {/* 1 — Talon (coloré) : bord haut + gauche + droite */}
        <div className="rounded-t-card border-[1.5px] border-b-0 border-ink p-5 tone-amber">
          <p className="eyebrow text-foreground/60">Accueillez nos ateliers</p>
          <h2 className="mt-1 font-display text-xl leading-tight">
            Faites vivre votre lieu autrement
          </h2>
          <p className="mt-2 text-sm font-medium text-foreground/80">
            Recevez une clientèle créative un soir creux, sans rien gérer. Dites-nous tout sur
            votre lieu&nbsp;: on revient vers vous sous 48&nbsp;h.
          </p>
          <ul className="mt-4 space-y-2">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <Icon className="h-4 w-4 shrink-0 text-ink" strokeWidth={2} aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2 — Bande de perforation : pas de bordure latérale, encoches ouvertes */}
        <div className="relative h-6 overflow-hidden">
          <div className="absolute inset-x-7 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-ink/40" />
          <span className="absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-background" aria-hidden />
          <span className="absolute left-full top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-background" aria-hidden />
        </div>

        {/* 3 — Partie détachable : le formulaire (bord gauche + droite + bas) */}
        <div className="overflow-hidden rounded-b-card border-[1.5px] border-t-0 border-ink bg-surface">
          <PartenaireForm defaultEmail={defaultEmail} />
        </div>
      </Reveal>
    </main>
  );
}

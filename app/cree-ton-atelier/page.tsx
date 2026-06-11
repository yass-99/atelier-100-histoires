import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { Gem, Users, CalendarHeart } from "lucide-react";
import { Reveal } from "@/components/motion";
import { DevisForm } from "./devis-form";

export const metadata: Metadata = {
  title: "Crée ton atelier privé — anniversaire, entre amis, équipe",
  description:
    "Un atelier créatif rien que pour ton groupe en Île-de-France : anniversaire, sortie entre amis, évènement d'équipe ou enterrement de vie de jeune fille (EVJF). Chacun fabrique son bijou et le garde. Réponse en 24 h.",
};

const POINTS = [
  { icon: Users, text: "Vous êtes entre vous : tes amis, ta famille ou ton équipe" },
  { icon: Gem, text: "Chacun repart avec ce qu'il a fabriqué" },
  { icon: CalendarHeart, text: "Pour un anniversaire, une sortie entre amis, ou juste pour le plaisir" },
];

export default async function CreeTonAtelierPage() {
  const user = await currentUser();
  const defaultEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <main className="screen py-8">
      <h1 className="text-center font-display text-2xl">Crée ton atelier</h1>

      {/* Ticket en 3 sections (même structure que la page de réservation) :
          talon coloré, bande de perforation aux encoches ouvertes, puis le
          formulaire comme partie détachable. */}
      <Reveal className="mt-6 drop-shadow-[0_14px_36px_rgba(18,19,23,0.12)]">
        {/* 1 — Talon (coloré) : bord haut + gauche + droite */}
        <div className="rounded-t-card border-[1.5px] border-b-0 border-ink p-5 tone-amber">
          <p className="eyebrow text-foreground/60">Atelier privé · rien que pour vous</p>
          <h2 className="mt-1 font-display text-xl leading-tight">
            Un atelier rien que pour ta bande
          </h2>
          <p className="mt-2 text-sm font-medium text-foreground/80">
            Dis-nous l&apos;occasion et combien vous êtes. On prépare tout et on t&apos;envoie le
            prix en moins de 24 h.
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
          <DevisForm defaultEmail={defaultEmail} />
        </div>
      </Reveal>
    </main>
  );
}

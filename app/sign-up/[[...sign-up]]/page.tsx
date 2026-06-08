import Link from "next/link";
import { Suspense } from "react";
import { Ticket, ShieldCheck, CalendarCheck } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Créer un compte — Atelier aux 100 histoires" };

const PERKS = [
  { icon: Ticket, label: "Réserve en 2 min", tone: "bg-brand-soft" },
  { icon: ShieldCheck, label: "Sans mot de passe", tone: "bg-mint-soft" },
  { icon: CalendarCheck, label: "Annulation simple", tone: "bg-amber-soft" },
];

export default function SignUpPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <div className="screen py-12">
        <div className="flex flex-col items-center text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground/60">
            Atelier aux 100 histoires
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[1.05]">
            <span className="font-bold">Rejoins</span>{" "}
            <span className="font-black uppercase text-brand-ink">l&apos;atelier</span>
            <span className="font-black"> !</span>
          </h1>
          <p className="mt-3 text-base font-medium text-muted">
            Crée ton compte en un instant, sans mot de passe.
          </p>
        </div>

        <Reveal className="mt-8 space-y-5">
          <Suspense fallback={<div className="card h-64 animate-pulse" />}>
            <SignUpForm />
          </Suspense>

          <ul className="grid grid-cols-3 gap-3">
            {PERKS.map(({ icon: Icon, label, tone }) => (
              <li
                key={label}
                className={`flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-ink p-3 text-center ${tone}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                <span className="text-xs font-bold leading-tight">{label}</span>
              </li>
            ))}
          </ul>

          <div className="card flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Déjà un compte ?</p>
            <Link href="/sign-in" className="btn-outline min-h-10 px-4 py-2 text-sm">
              Se connecter
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

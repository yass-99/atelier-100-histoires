import Link from "next/link";
import { ShieldCheck, Mail, Zap } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Connexion — Atelier aux 100 histoires" };

const PERKS = [
  { icon: ShieldCheck, label: "Sans mot de passe", tone: "bg-mint-soft" },
  { icon: Mail, label: "Code par email", tone: "bg-brand-soft" },
  { icon: Zap, label: "En 30 secondes", tone: "bg-amber-soft" },
];

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col justify-center">
      <div className="screen py-12">
        <div className="flex flex-col items-center text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground/60">
            Atelier aux 100 histoires
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[1.05]">
            <span className="font-bold">Content de</span>{" "}
            <span className="font-black uppercase text-brand-ink">te revoir</span>
            <span className="font-black"> !</span>
          </h1>
          <p className="mt-3 text-base font-medium text-muted">
            Connecte-toi avec ton email, sans mot de passe.
          </p>
        </div>

        <Reveal className="mt-8 space-y-5">
          <SignInForm />

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
            <p className="text-sm font-semibold">Première fois ici ?</p>
            <Link href="/sign-up" className="btn-amber min-h-10 px-4 py-2 text-sm">
              Créer un compte
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

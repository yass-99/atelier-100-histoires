import Link from "next/link";
import { Check, Mail, ArrowRight } from "lucide-react";
import { Pop, Floaty } from "@/components/motion";

export const metadata = { title: "Réservation confirmée — Atelier des 100 histoires" };

export default function Merci() {
  return (
    <main className="screen py-12">
      <Pop>
        <div className="relative overflow-hidden rounded-card tone-lime p-7 text-center shadow-lift">
          <Floaty className="blob -right-10 -top-10 h-40 w-40 bg-magenta/30" />
          <Floaty className="blob -bottom-12 -left-10 h-40 w-40 bg-brand/40" />

          <div className="relative flex flex-col items-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-on-ink shadow-lift">
              <Check className="h-10 w-10" strokeWidth={2.2} />
            </span>
            <h1 className="mt-5 font-display text-3xl">Réservation confirmée&nbsp;!</h1>
            <p className="mt-2 max-w-xs text-ink/80">
              Ton paiement est validé et ta place est réservée. À très vite pour écrire ensemble&nbsp;!
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-ink">
              <Mail className="h-4 w-4" strokeWidth={1.8} />
              Un email de confirmation t&apos;a été envoyé
            </div>

            <Link href="/" className="btn-primary mt-7 w-full">
              Découvrir d&apos;autres ateliers
              <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </Pop>
    </main>
  );
}

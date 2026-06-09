import Link from "next/link";
import { BellRing, ArrowRight } from "lucide-react";

export function RestePrevenu() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-card border-[1.5px] border-ink bg-amber-soft p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink">
          <BellRing className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-display text-lg leading-tight">Sois prévenu des prochains ateliers</p>
          <p className="mt-1 text-sm text-foreground/70">
            Crée ton compte pour ne rater aucune date — bijoux, peinture, mosaïque…
          </p>
        </div>
      </div>
      <Link href="/sign-up" className="btn-primary w-full shrink-0 sm:w-auto">
        Créer un compte <ArrowRight className="h-5 w-5" />
      </Link>
    </section>
  );
}

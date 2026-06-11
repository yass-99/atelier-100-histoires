"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight } from "lucide-react";

/**
 * Bande d'action « incrustée » vers la demande d'atelier privé. En AMBRE
 * (couleur d'action de la DA), distincte des pavés bleus. Sert de CTA dans la
 * section « Pour les groupes » et dans l'état « aucun atelier ».
 * `from` permet de tracer d'où vient le clic (event Vercel `cree_atelier_clic`).
 */
export function CreeTonAtelierCta({ from = "home" }: { from?: string }) {
  return (
    <Link
      href="/cree-ton-atelier"
      onClick={() => track("cree_atelier_clic", { from })}
      className="flex items-center gap-3 rounded-card tone-amber border-[1.5px] border-ink p-4 shadow-emboss transition active:scale-[.99]"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-extrabold leading-tight text-ink">
          Crée ton atelier privé
        </span>
        <span className="mt-0.5 block text-sm font-medium text-ink/75">
          On te répond en 24 h.
        </span>
      </span>
      <span className="arrow-fab h-10 w-10 shrink-0">
        <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
      </span>
    </Link>
  );
}

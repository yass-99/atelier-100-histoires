"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { UsersRound, ArrowRight } from "lucide-react";

/**
 * Bloc contextuel sur la fiche atelier : « tu préfères en privé ? » → demande
 * d'atelier sur-mesure. Client pour tracer le clic (event `cree_atelier_clic`).
 */
export function PrivateAtelierBlock() {
  return (
    <Link
      href="/cree-ton-atelier"
      onClick={() => track("cree_atelier_clic", { from: "atelier_page" })}
      className="card mt-8 flex items-center gap-3 transition hover:border-ink/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <UsersRound className="h-5 w-5" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-extrabold">
          Tu préfères en privé avec ta bande&nbsp;?
        </span>
        <span className="block text-sm text-muted">
          Anniversaire, entre amis ou en équipe — crée ton atelier.
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-ink" strokeWidth={2} aria-hidden />
    </Link>
  );
}

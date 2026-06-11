"use client";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

/**
 * Bandeau « remise active » : rappel persistant de la remise mystère du compte
 * connecté, calculée côté serveur (passée en prop, jamais de flash). Se cale
 * sous le header (sticky top-16) et se masque sur les pages atelier au design
 * immersif — là, les prix barrés et le ticket de réservation prennent le relais.
 */
export function DiscountBanner({ pct }: { pct: number | null }) {
  const pathname = usePathname();
  if (!pct || pathname?.startsWith("/ateliers/")) return null;

  return (
    <div
      role="status"
      className="sticky top-16 z-20 border-b-[1.5px] border-ink bg-amber text-ink"
    >
      <div className="screen flex items-center justify-center gap-2 py-2 text-center text-sm font-bold">
        <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden />
        <span>
          Ta remise mystère de{" "}
          <span className="tabular-nums">−{pct}&nbsp;%</span> est active — appliquée
          au paiement.
        </span>
      </div>
    </div>
  );
}

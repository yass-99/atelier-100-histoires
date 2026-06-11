"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import LogoLoop from "@/components/LogoLoop";
import { LieuIcon } from "@/components/LieuIcon";
import type { TypeLieu } from "@/lib/partenaire.shared";

type BandLieu = { id: string; nom: string; type_lieu: TypeLieu };

/**
 * Bandeau « Nos lieux partenaires » sur l'accueil : marquee LogoLoop de pastilles
 * monochromes (contour seul, aplats sans dégradé → pas de fadeOut). Tout le bandeau
 * mène à la page /partenaires. Pause au survol, respecte prefers-reduced-motion.
 */
export function PartenairesBand({ partenaires }: { partenaires: BandLieu[] }) {
  if (partenaires.length === 0) return null;

  const logos = partenaires.map((p) => ({
    title: p.nom,
    ariaLabel: p.nom,
    node: (
      <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-transparent px-4 py-2">
        <LieuIcon type={p.type_lieu} className="h-[18px] w-[18px] text-foreground" />
        <span className="whitespace-nowrap font-display text-sm font-extrabold text-foreground">
          {p.nom}
        </span>
      </span>
    ),
  }));

  return (
    <section aria-label="Nos lieux partenaires">
      <p className="eyebrow text-muted">Ils nous accueillent</p>
      <h2 className="mt-1 font-display text-2xl">Nos lieux partenaires</h2>

      <Link
        href="/partenaires"
        aria-label="Voir tous nos lieux partenaires"
        onClick={() => track("partenaires_band_marquee")}
        className="mt-3 block overflow-hidden rounded-2xl"
      >
        <LogoLoop
          logos={logos}
          speed={32}
          direction="left"
          logoHeight={28}
          gap={12}
          ariaLabel="Nos lieux partenaires"
        />
      </Link>

      <Link
        href="/partenaires"
        onClick={() => track("partenaires_band_cta")}
        className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-extrabold text-brand-ink"
      >
        Découvrir nos lieux
        <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
      </Link>
    </section>
  );
}

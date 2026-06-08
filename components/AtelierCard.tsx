import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatEUR } from "@/lib/money";
import { dayNumber, monthShort, toneForIndex } from "@/lib/ui";

export function AtelierCard({ s, index = 0 }: { s: Session; index?: number }) {
  const restantes = placesRestantes(s);
  const complet = restantes <= 0;
  const tone = toneForIndex(index);

  return (
    <Link
      href={`/ateliers/${s.id}`}
      className={`group flex items-center gap-4 rounded-card ${tone} p-3.5 shadow-soft transition active:scale-[.98]`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/25">
        {s.image_url ? (
          <Image src={s.image_url} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-extrabold leading-none">{dayNumber(s.date_heure)}</span>
            <span className="text-[10px] font-bold uppercase opacity-70">{monthShort(s.date_heure)}</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow truncate opacity-70">{s.lieu}</p>
        <h3 className="mt-0.5 truncate font-display text-lg leading-tight">{s.titre}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm font-bold">
          <span className="opacity-80">
            {complet ? "Complet" : `${restantes} place${restantes > 1 ? "s" : ""}`}
          </span>
          <span className="opacity-40">•</span>
          <span>{formatEUR(s.prix_cents)}</span>
        </div>
      </div>
      <span className="arrow-fab bg-white text-ink group-hover:scale-105" aria-hidden>
        <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
      </span>
    </Link>
  );
}

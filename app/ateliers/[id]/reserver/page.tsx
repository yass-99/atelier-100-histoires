import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/sessions";
import { placesRestantes } from "@/lib/sessions.shared";
import { formatDateLong } from "@/lib/ui";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { ReserveForm } from "../reserve-form";

export const dynamic = "force-dynamic";

export default async function ReserverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();
  const restantes = placesRestantes(s);
  if (restantes <= 0) notFound();

  return (
    <main className="screen py-5 pb-28">
      <div className="flex items-center gap-3">
        <CircleButton as="link" href={`/ateliers/${s.id}`} label="Retour à l'atelier">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </CircleButton>
        <h1 className="font-display text-2xl">Réserver ma place</h1>
      </div>

      <Reveal className="mt-4">
        <div className="flex items-center gap-3 rounded-card tone-lavender p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/40">
            {s.image_url && <Image src={s.image_url} alt="" fill sizes="56px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold">{s.titre}</p>
            <p className="truncate text-sm capitalize text-ink/70">{formatDateLong(s.date_heure)}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-4">
        <ReserveForm sessionId={s.id} max={restantes} prixCents={s.prix_cents} />
      </Reveal>
    </main>
  );
}

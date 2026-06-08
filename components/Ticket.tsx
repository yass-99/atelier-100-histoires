import Image from "next/image";
import type { Booking, Session } from "@/lib/types";
import { formatEUR } from "@/lib/money";
import { formatHeure } from "@/lib/ui";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-0.5 font-display text-base font-extrabold">{value}</p>
    </div>
  );
}

export function Ticket({
  b,
  s,
  qr,
  seat,
}: {
  b: Booking;
  s: Session;
  qr: string;
  seat?: { index: number; total: number };
}) {
  const heure = formatHeure(s.date_heure);
  const jour = new Date(s.date_heure).toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "long",
  });
  const ref = b.id.slice(0, 8).toUpperCase();
  const multi = seat && seat.total > 1;

  return (
    <div className="ticket">
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-white/15">
        {s.image_url ? (
          <Image src={s.image_url} alt={s.titre} fill sizes="100vw" className="object-cover" />
        ) : (
          <p className="px-4 text-center font-display text-base font-extrabold text-white/90">{s.titre}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">Atelier aux 100 histoires</p>
        {multi && (
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
            Billet {seat!.index}/{seat!.total}
          </span>
        )}
      </div>
      <h2 className="mt-1 font-display text-2xl leading-tight">{s.titre}</h2>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Field label="Date" value={jour} />
        <Field label="Heure" value={heure} />
        <Field label="Réf." value={ref} />
        <Field label="Places" value={`${b.nb_places} (${formatEUR(b.montant_cents)})`} />
        <div className="col-span-2"><Field label="Lieu" value={s.lieu} /></div>
        <div className="col-span-2"><Field label="Au nom de" value={b.nom} /></div>
      </div>

      <div className="ticket-perf">
        <span className="ticket-notch ticket-notch-left" aria-hidden />
        <span className="ticket-notch ticket-notch-right" aria-hidden />
      </div>

      <div className="mt-12 flex flex-col items-center gap-2.5">
        <div className="rounded-2xl bg-white p-2.5">
          <Image src={qr} alt={`QR du billet ${seat ? seat.index : ref}`} width={116} height={116} unoptimized />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
          {multi ? `Place ${seat!.index} — à présenter à l'entrée` : "À présenter à l'entrée"}
        </p>
      </div>
    </div>
  );
}

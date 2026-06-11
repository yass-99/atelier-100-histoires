"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import { OCCASIONS, type Occasion } from "@/lib/devis.shared";
import { EASE } from "@/lib/motion";

/** Champ récap (libellé discret + valeur), dans la partie détachable du ticket. */
function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-display text-base font-extrabold text-foreground">{value}</p>
    </div>
  );
}

type Summary = { occasionLabel: string; nb: string; dates: string };

export function DevisForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!occasion) {
      setError("Choisis une occasion.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const nbRaw = String(fd.get("nb_personnes") ?? "").trim();
    const payload = {
      prenom: fd.get("prenom"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      occasion,
      nb_personnes: nbRaw === "" ? null : Number(nbRaw),
      type_atelier: fd.get("type_atelier"),
      dates_souhaitees: fd.get("dates_souhaitees"),
      message: fd.get("message"),
    };
    track("devis_demande", { occasion, nb_personnes: nbRaw || "?" });
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        track("devis_envoye", { occasion });
        setSummary({
          occasionLabel: OCCASIONS.find((o) => o.value === occasion)?.label ?? occasion,
          nb: nbRaw ? `${nbRaw} personnes` : "",
          dates: String(fd.get("dates_souhaitees") ?? "").trim(),
        });
        setDone(true);
      } else {
        track("devis_error", { reason: data.error ?? "unknown", status: res.status });
        setError(data.error ?? "Une erreur est survenue. Réessaie.");
        setLoading(false);
      }
    } catch {
      track("devis_error", { reason: "network", status: 0 });
      setError("Problème de connexion. Vérifie ta connexion et réessaie.");
      setLoading(false);
    }
  }

  if (done && summary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="space-y-4 p-5 text-center"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-soft text-mint">
          <Check className="h-6 w-6" strokeWidth={2.4} aria-hidden />
        </span>
        <h2 className="font-display text-2xl">C&apos;est envoyé&nbsp;!</h2>

        <div className="mx-auto grid max-w-xs grid-cols-2 gap-4 text-left">
          <TicketField label="Occasion" value={summary.occasionLabel} />
          {summary.nb ? <TicketField label="Personnes" value={summary.nb} /> : null}
          {summary.dates ? (
            <div className="col-span-2">
              <TicketField label="Dates souhaitées" value={summary.dates} />
            </div>
          ) : null}
        </div>

        <p className="mx-auto max-w-xs text-sm text-muted">
          On revient vers toi <b>sous 24 h</b> avec ta proposition et le prix. Un accusé
          t&apos;attend déjà dans ta boîte mail.
        </p>
        <Link href="/" className="btn-primary mt-1 px-5">
          Voir les ateliers
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" required autoComplete="given-name" placeholder="Ton prénom" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required inputMode="email" autoComplete="email" placeholder="pour te répondre" defaultValue={defaultEmail} className="field" />
        </div>
      </div>

      <div>
        <span className="field-label">C&apos;est pour quelle occasion&nbsp;?</span>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => {
            const active = occasion === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setOccasion(o.value)}
                aria-pressed={active}
                className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-bold transition active:scale-95 ${
                  active
                    ? "border-ink bg-brand text-white"
                    : "border-ink/15 bg-surface text-foreground hover:border-ink/30"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="nb_personnes">Combien de personnes&nbsp;?</label>
          <input id="nb_personnes" name="nb_personnes" type="number" inputMode="numeric" min={1} placeholder="environ" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="type_atelier">Type d&apos;atelier</label>
          <select id="type_atelier" name="type_atelier" defaultValue="Bijoux" className="field">
            <option value="Bijoux">Bijoux</option>
            <option value="Autre / à discuter">Autre / à discuter</option>
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="dates_souhaitees">Date(s) souhaitée(s)</label>
        <input id="dates_souhaitees" name="dates_souhaitees" placeholder="ex. un samedi de juillet, ou le 12/09" className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="phone">Téléphone <span className="font-normal text-muted">(optionnel)</span></label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="si tu préfères qu'on t'appelle" className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="message">Ton idée, ton budget, tes envies <span className="font-normal text-muted">(optionnel)</span></label>
        <textarea id="message" name="message" rows={3} placeholder="Raconte-nous en quelques mots" className="field resize-none" />
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}

      <button className="btn-primary h-14 w-full" disabled={loading}>
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Envoi…</>
        ) : (
          <><Send className="h-4 w-4" strokeWidth={2} /> Envoyer ma demande</>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        On utilise tes infos uniquement pour répondre à ta demande —{" "}
        <Link href="/confidentialite" className="underline">confidentialité</Link>.
      </p>
    </form>
  );
}

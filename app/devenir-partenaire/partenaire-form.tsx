"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import { TYPES_LIEU, CRENEAUX, type TypeLieu, type Creneau } from "@/lib/partenaire.shared";
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

type Summary = { nomLieu: string; typeLabel: string; ville: string };

export function PartenaireForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [typeLieu, setTypeLieu] = useState<TypeLieu | null>(null);
  const [creneaux, setCreneaux] = useState<Set<Creneau>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  function toggleCreneau(value: Creneau) {
    setCreneaux((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!typeLieu) {
      setError("Choisis un type de lieu.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const placesRaw = String(fd.get("places_assises") ?? "").trim();
    const payload = {
      nom_lieu: fd.get("nom_lieu"),
      email: fd.get("email"),
      prenom: fd.get("prenom"),
      phone: fd.get("phone"),
      ville: fd.get("ville"),
      places_assises: placesRaw === "" ? null : Number(placesRaw),
      type_lieu: typeLieu,
      creneaux: Array.from(creneaux),
      lien: fd.get("lien"),
      message: fd.get("message"),
    };
    track("partenaire_demande", { type_lieu: typeLieu });
    try {
      const res = await fetch("/api/partenaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        track("partenaire_envoye", { type_lieu: typeLieu });
        setSummary({
          nomLieu: String(fd.get("nom_lieu") ?? "").trim(),
          typeLabel: TYPES_LIEU.find((t) => t.value === typeLieu)?.label ?? typeLieu,
          ville: String(fd.get("ville") ?? "").trim(),
        });
        setDone(true);
      } else {
        track("partenaire_error", { reason: data.error ?? "unknown", status: res.status });
        setError(data.error ?? "Une erreur est survenue. Réessaie.");
        setLoading(false);
      }
    } catch {
      track("partenaire_error", { reason: "network", status: 0 });
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
        <h2 className="font-display text-2xl">Candidature envoyée&nbsp;!</h2>

        <div className="mx-auto grid max-w-xs grid-cols-2 gap-4 text-left">
          <div className="col-span-2">
            <TicketField label="Établissement" value={summary.nomLieu} />
          </div>
          <TicketField label="Type de lieu" value={summary.typeLabel} />
          {summary.ville ? <TicketField label="Ville / quartier" value={summary.ville} /> : null}
        </div>

        <p className="mx-auto max-w-xs text-sm text-muted">
          On étudie votre lieu et on revient vers vous <b>sous 48 h</b>. Un accusé vous attend
          déjà dans votre boîte mail.
        </p>
        <Link href="/" className="btn-primary mt-1 px-5">
          Découvrir l&apos;Atelier
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <div>
        <label className="field-label" htmlFor="nom_lieu">Nom de votre établissement</label>
        <input id="nom_lieu" name="nom_lieu" required placeholder="ex. Boulangerie Le Fournil" className="field" />
      </div>

      {/* Email mis en avant : pleine largeur, plus grand, juste sous le nom du lieu. */}
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="pour vous répondre"
          defaultValue={defaultEmail}
          className="field min-h-14 text-lg"
        />
      </div>

      <div>
        <span className="field-label">Type de lieu</span>
        <div className="flex flex-wrap gap-2">
          {TYPES_LIEU.map((t) => {
            const active = typeLieu === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTypeLieu(t.value)}
                aria-pressed={active}
                className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-bold transition active:scale-95 ${
                  active
                    ? "border-ink bg-brand text-white"
                    : "border-ink/15 bg-surface text-foreground hover:border-ink/30"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="prenom">Votre prénom</label>
          <input id="prenom" name="prenom" required autoComplete="given-name" placeholder="contact sur place" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="places_assises">Places assises</label>
          <input id="places_assises" name="places_assises" type="number" inputMode="numeric" min={1} step={1} required placeholder="ex. 12" className="field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="ex. 06 12 34 56 78" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="ville">Ville / quartier</label>
          <input id="ville" name="ville" required placeholder="ex. Vieux-Port" className="field" />
        </div>
      </div>

      <div>
        <span className="field-label">
          Créneaux possibles <span className="font-normal text-muted">(optionnel · plusieurs)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CRENEAUX.map((c) => {
            const active = creneaux.has(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCreneau(c.value)}
                aria-pressed={active}
                className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-bold transition active:scale-95 ${
                  active
                    ? "border-ink bg-ink text-on-ink"
                    : "border-ink/15 bg-surface text-foreground hover:border-ink/30"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="lien">
          Lien <span className="font-normal text-muted">(optionnel · site, Instagram, Maps)</span>
        </label>
        <input id="lien" name="lien" type="url" inputMode="url" placeholder="https://instagram.com/votre-lieu" className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="message">
          Ce qui rend votre lieu unique <span className="font-normal text-muted">(optionnel)</span>
        </label>
        <textarea id="message" name="message" rows={3} placeholder="Ambiance, spécialité, ce que vous offririez aux participants…" className="field resize-none" />
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}

      <button className="btn-primary h-14 w-full" disabled={loading}>
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Envoi…</>
        ) : (
          <><Send className="h-4 w-4" strokeWidth={2} /> Envoyer ma candidature</>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        On utilise vos infos uniquement pour étudier le partenariat —{" "}
        <Link href="/confidentialite" className="underline">confidentialité</Link>.
      </p>
    </form>
  );
}

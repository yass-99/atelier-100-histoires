"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { Minus, Plus, Loader2, Lock, Gift, ShieldCheck } from "lucide-react";
import { formatEUR } from "@/lib/money";
import { SPRING_SNAPPY, T_FAST } from "@/lib/motion";

export function ReserveForm({
  sessionId, max, prixCents, defaultEmail = "", pct = null,
}: {
  sessionId: string; max: number; prixCents: number; defaultEmail?: string; pct?: number | null;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remise = celle du compte connecté (calculée serveur). Seule source honorée
  // au paiement : pas de détection par email tapé (anti-abus).
  const discount = pct;
  const total = qty * prixCents;
  // Même formule que le serveur (app/api/checkout) : arrondi sur le total en cents.
  const totalDu = discount ? Math.round((total * (100 - discount)) / 100) : total;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const prenom = String(fd.get("prenom") ?? "").trim();
    const nom = String(fd.get("nom") ?? "").trim();
    track("checkout_started", { qty, value: totalDu / 100, pct: discount ?? 0 });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          nb_places: qty,
          nom: `${prenom} ${nom}`.trim(),
          email: fd.get("email"),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        track("checkout_error", { reason: data.error ?? "unknown", status: res.status });
        setError(data.error ?? "Une erreur est survenue. Réessaie.");
        setLoading(false);
      }
    } catch {
      track("checkout_error", { reason: "network", status: 0 });
      setError("Problème de connexion. Vérifie ta connexion et réessaie.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5 pt-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" required autoComplete="given-name" placeholder="Ton prénom" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="nom">Nom</label>
          <input id="nom" name="nom" required autoComplete="family-name" placeholder="Ton nom" className="field" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required inputMode="email" autoComplete="email" placeholder="pour recevoir ta confirmation" defaultValue={defaultEmail} className="field" />
        {discount && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-success" role="status">
            <Gift className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Ta remise mystère de −{discount} % sera appliquée au paiement.
          </p>
        )}
      </div>

      <div>
        <span className="field-label">Nombre de places</span>
        <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-ink/15 bg-background p-2">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Retirer une place" className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-40">
            <Minus className="h-5 w-5" strokeWidth={2} />
          </button>
          <motion.span key={qty} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING_SNAPPY} className="font-display text-2xl font-extrabold tabular-nums" aria-live="polite" role="spinbutton" aria-valuemin={1} aria-valuemax={max} aria-valuenow={qty} aria-label="Nombre de places">{qty}</motion.span>
          <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="Ajouter une place" className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-40">
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">{max} place{max > 1 ? "s" : ""} restante{max > 1 ? "s" : ""}</p>
      </div>

      {/* Total */}
      <div className="flex items-baseline justify-between border-t border-dashed border-ink/20 pt-3">
        <span className="text-sm font-bold">
          {qty} place{qty > 1 ? "s" : ""} × {formatEUR(prixCents)}
          {discount ? <span className="block font-medium text-success">Remise mystère −{discount} %</span> : null}
        </span>
        <motion.span key={totalDu} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={T_FAST} className="font-display text-2xl font-extrabold tabular-nums">
          {discount ? (
            <><span className="mr-2 text-base font-semibold text-muted line-through">{formatEUR(total)}</span>{formatEUR(totalDu)}</>
          ) : (
            formatEUR(total)
          )}
        </motion.span>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}

      <button className="btn-primary h-14 w-full" disabled={loading}>
        {loading ? (<><Loader2 className="h-5 w-5 animate-spin" /> Accès au paiement sécurisé…</>) : (<><Lock className="h-4 w-4" strokeWidth={1.8} /> Payer {formatEUR(totalDu)}</>)}
      </button>
      <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center text-xs text-muted">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2} aria-hidden />
        <span className="font-medium text-foreground">Annulation gratuite jusqu&apos;à 48 h avant</span>
        <span aria-hidden>·</span>
        Paiement sécurisé Stripe
        <span aria-hidden>·</span>
        <Link href="/cgv" className="underline">CGV</Link>
      </p>
    </form>
  );
}

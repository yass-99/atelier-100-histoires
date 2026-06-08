"use client";
import { useState } from "react";
import { Minus, Plus, Loader2, Lock } from "lucide-react";
import { formatEUR } from "@/lib/money";

export function ReserveForm({
  sessionId,
  max,
  prixCents,
}: {
  sessionId: string;
  max: number;
  prixCents: number;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = qty * prixCents;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          nb_places: qty,
          nom: fd.get("nom"),
          email: fd.get("email"),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Une erreur est survenue. Réessaie.");
        setLoading(false);
      }
    } catch {
      setError("Problème de connexion. Vérifie ta connexion et réessaie.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-display text-xl">Réserver ma place</h2>

      <div>
        <label className="field-label" htmlFor="nom">
          Nom complet
        </label>
        <input
          id="nom"
          name="nom"
          required
          autoComplete="name"
          placeholder="Ton prénom et nom"
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="pour recevoir ta confirmation"
          className="field"
        />
      </div>

      <div>
        <span className="field-label">Nombre de places</span>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Retirer une place"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-40"
          >
            <Minus className="h-5 w-5" strokeWidth={2} />
          </button>
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            aria-label="Ajouter une place"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-40"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {max} place{max > 1 ? "s" : ""} disponible{max > 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Redirection…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" strokeWidth={1.8} /> Payer {formatEUR(total)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        Paiement 100&nbsp;% sécurisé via Stripe
      </p>
    </form>
  );
}

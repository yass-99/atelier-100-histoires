"use client";
import { useState } from "react";

export function ReserveForm({ sessionId, max }: { sessionId: string; max: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          nb_places: Number(fd.get("nb_places")),
          nom: fd.get("nom"),
          email: fd.get("email"),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
      }
    } catch {
      setError("Une erreur réseau est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-3">
      <h2 className="text-xl">Réserver</h2>
      <label className="block text-sm font-medium">
        Nom
        <input
          name="nom"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-border px-3 py-3"
        />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-border px-3 py-3"
        />
      </label>
      <label className="block text-sm font-medium">
        Nombre de places
        <input
          name="nb_places"
          type="number"
          min={1}
          max={max}
          defaultValue={1}
          required
          className="mt-1 w-full rounded-lg border border-border px-3 py-3"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Redirection…" : "Réserver et payer"}
      </button>
    </form>
  );
}

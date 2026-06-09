"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { euroToCents } from "@/lib/money";
import type { PublicCible, SessionStatus } from "@/lib/types";
import { createSession } from "./actions";

export function AtelierForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [publicCible, setPublicCible] = useState<PublicCible>("tous");
  const [consoIncluse, setConsoIncluse] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const dateLocal = String(fd.get("date") ?? "");
    const d = new Date(dateLocal); // saisie navigateur (heure locale = Paris pour l'orga)
    if (isNaN(d.getTime())) {
      setError("Date et heure obligatoires.");
      return;
    }

    const image_urls = String(fd.get("photos") ?? "")
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const input = {
      titre: String(fd.get("titre") ?? ""),
      description: String(fd.get("description") ?? ""),
      dateISO: d.toISOString(),
      duree: Number(fd.get("duree")),
      lieu: String(fd.get("lieu") ?? ""),
      capacite: Number(fd.get("capacite")),
      prix_cents: euroToCents(Number(fd.get("prix") || 0)),
      statut: String(fd.get("statut") ?? "brouillon") as SessionStatus,
      image_urls,
      a_la_une: fd.get("a_la_une") === "on",
      public_cible: (String(fd.get("public_cible") ?? "tous") || "tous") as PublicCible,
      age_minimum: fd.get("age_minimum") ? Number(fd.get("age_minimum")) : null,
      conso_incluse: fd.get("conso_incluse") === "on",
      conso_detail: String(fd.get("conso_detail") ?? ""),
    };

    startTransition(async () => {
      const res = await createSession(input);
      if (res.ok) {
        setOk(true);
        form.reset();
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="field-label" htmlFor="titre">Titre</label>
        <input id="titre" name="titre" required placeholder="Écrire sa première histoire" className="field" />
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} placeholder="Ce que les participants vont vivre…" className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="date">Date &amp; heure</label>
          <input id="date" name="date" type="datetime-local" required className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="duree">Durée (min)</label>
          <input id="duree" name="duree" type="number" min={1} defaultValue={120} required className="field" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="lieu">Lieu</label>
        <input id="lieu" name="lieu" placeholder="Paris 11e" className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="public_cible">Public</label>
          <select
            id="public_cible"
            name="public_cible"
            value={publicCible}
            onChange={(e) => setPublicCible(e.target.value as PublicCible)}
            className="field"
          >
            <option value="tous">Tous publics</option>
            <option value="adultes">Adultes</option>
            <option value="enfants">Enfants</option>
          </select>
        </div>
        {publicCible !== "adultes" && (
          <div>
            <label className="field-label" htmlFor="age_minimum">Âge minimum (optionnel)</label>
            <input id="age_minimum" name="age_minimum" type="number" min={1} placeholder="ex. 7" className="field" />
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-2xl border-[1.5px] border-ink/15 bg-surface px-4 py-3">
        <input
          type="checkbox"
          name="conso_incluse"
          checked={consoIncluse}
          onChange={(e) => setConsoIncluse(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
        />
        <span className="min-w-0">
          <span className="block font-bold text-foreground">Consommation sur place incluse</span>
          <span className="block text-sm text-muted">
            Comprise dans le prix (atelier en boulangerie, restaurant…).
          </span>
        </span>
      </label>

      {consoIncluse && (
        <div>
          <label className="field-label" htmlFor="conso_detail">Détail conso (optionnel)</label>
          <input
            id="conso_detail"
            name="conso_detail"
            placeholder="boisson chaude + pâtisserie incluses"
            className="field"
          />
        </div>
      )}

      <div>
        <label className="field-label" htmlFor="photos">Photos — une URL par ligne (carrousel)</label>
        <textarea id="photos" name="photos" rows={3} placeholder={"https://…/photo1.jpg\nhttps://…/photo2.jpg"} className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="capacite">Capacité</label>
          <input id="capacite" name="capacite" type="number" min={1} defaultValue={10} required className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="prix">Prix (€)</label>
          <input id="prix" name="prix" type="number" min={0} step="0.01" defaultValue={0} required className="field" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="statut">Statut</label>
        <select id="statut" name="statut" defaultValue="brouillon" className="field">
          <option value="brouillon">Brouillon (caché)</option>
          <option value="publie">Publié (visible)</option>
        </select>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border-[1.5px] border-ink/15 bg-surface px-4 py-3">
        <input
          type="checkbox"
          name="a_la_une"
          className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
        />
        <span className="min-w-0">
          <span className="block font-bold text-foreground">Mettre à la une</span>
          <span className="block text-sm text-muted">
            Affiché en grand dans le hero photo de l&apos;accueil (atelier publié uniquement).
          </span>
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}
      {ok && (
        <p role="status" className="rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success">Atelier créé&nbsp;!</p>
      )}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? <><Loader2 className="h-5 w-5 animate-spin" /> Création…</> : <><Plus className="h-5 w-5" /> Créer l&apos;atelier</>}
      </button>
    </form>
  );
}

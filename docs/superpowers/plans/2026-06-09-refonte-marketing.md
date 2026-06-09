# Refonte marketing — Plan d'implémentation (chantiers 1–4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Champs public/consommation sur les ateliers (DB + admin + badges), réécriture des textes marketing (ateliers créatifs, pas écriture), pop-up « réduction mystère » avec consentement RGPD, et remise appliquée automatiquement au checkout Stripe.

**Architecture:** Next.js App Router (v16 — lire `node_modules/next/dist/docs/` avant de coder en cas de doute), Supabase (client admin serveur, migrations SQL appliquées via MCP Supabase, projet `lnqnqwbwlatiehhgxjhq`), Stripe Checkout (coupons `mystere_5/10/15` créés paresseusement), Clerk. Helpers purs dans `lib/*.shared.ts` (testables par vitest), accès DB dans `lib/*.ts` marqués `server-only` — c'est le pattern existant (`sessions.shared.ts`).

**Tech Stack:** Next 16.2.7, React 19, Tailwind 4, Supabase JS, Stripe 22, vitest 4, framer-motion, lucide-react.

**Hors périmètre :** preuve sociale (chantier 5 de la spec) — explicitement reportée par l'utilisateur.

---

### Task 1 : Migration `sessions` (public/conso) + types

**Files:**
- Create: `supabase/migrations/2026-06-09_session_public_conso.sql`
- Modify: `lib/types.ts`

- [ ] **Step 1 : Écrire la migration**

```sql
-- Public visé & consommation sur place par atelier.
alter table public.sessions
  add column if not exists public_cible text not null default 'tous'
    check (public_cible in ('adultes','enfants','tous')),
  add column if not exists age_minimum int,
  add column if not exists conso_incluse boolean not null default false,
  add column if not exists conso_detail text;
```

- [ ] **Step 2 : Appliquer via MCP Supabase** (`apply_migration`, projet `lnqnqwbwlatiehhgxjhq`, name `session_public_conso`). Vérifier ensuite avec `list_tables` que les 4 colonnes existent.

- [ ] **Step 3 : Étendre `lib/types.ts`**

```ts
export type PublicCible = "adultes" | "enfants" | "tous";

// Dans Session, après a_la_une :
  public_cible: PublicCible;
  age_minimum: number | null;
  conso_incluse: boolean;
  conso_detail: string | null;
```

- [ ] **Step 4 : Commit** — `feat(db): public vise et consommation sur les ateliers`

### Task 2 : Helper `publicCibleLabel` (TDD)

**Files:**
- Modify: `lib/sessions.shared.ts` (lire d'abord — il contient `placesRestantes`)
- Test: `lib/sessions.shared.test.ts` (créer ou compléter s'il existe)

- [ ] **Step 1 : Test qui échoue**

```ts
import { describe, expect, it } from "vitest";
import { publicCibleLabel } from "./sessions.shared";

describe("publicCibleLabel", () => {
  it("adultes", () => expect(publicCibleLabel("adultes", null)).toBe("Adultes"));
  it("enfants sans âge", () => expect(publicCibleLabel("enfants", null)).toBe("Enfants"));
  it("enfants avec âge", () => expect(publicCibleLabel("enfants", 7)).toBe("Enfants · dès 7 ans"));
  it("tous publics avec âge", () => expect(publicCibleLabel("tous", 6)).toBe("Tous publics · dès 6 ans"));
  it("adultes ignore l'âge", () => expect(publicCibleLabel("adultes", 18)).toBe("Adultes"));
});
```

- [ ] **Step 2 : `npx vitest run lib/sessions.shared.test.ts`** → FAIL (fonction absente)

- [ ] **Step 3 : Implémentation dans `lib/sessions.shared.ts`**

```ts
import type { PublicCible } from "./types";

/** Libellé visiteur du public visé, avec âge minimum éventuel. */
export function publicCibleLabel(publicCible: PublicCible, ageMinimum: number | null): string {
  const base =
    publicCible === "adultes" ? "Adultes" : publicCible === "enfants" ? "Enfants" : "Tous publics";
  if (ageMinimum && publicCible !== "adultes") return `${base} · dès ${ageMinimum} ans`;
  return base;
}
```

- [ ] **Step 4 : Tests verts** puis **Step 5 : Commit** — `feat: libelle public vise`

### Task 3 : Admin — formulaire et action

**Files:**
- Modify: `app/admin/actions.ts` (NewSessionInput + validation + insert)
- Modify: `app/admin/AtelierForm.tsx`

- [ ] **Step 1 : `actions.ts`** — ajouter à `NewSessionInput` :

```ts
  public_cible: PublicCible;
  age_minimum: number | null;
  conso_incluse: boolean;
  conso_detail: string;
```

Validation dans `createSession` (après prix) :

```ts
  const publics: PublicCible[] = ["adultes", "enfants", "tous"];
  if (!publics.includes(input.public_cible))
    return { ok: false, error: "Public invalide." };
  const ageMin =
    input.public_cible !== "adultes" && Number.isFinite(input.age_minimum) && input.age_minimum! > 0
      ? Math.round(input.age_minimum!)
      : null;
```

Insert : `public_cible: input.public_cible, age_minimum: ageMin, conso_incluse: !!input.conso_incluse, conso_detail: input.conso_incluse ? input.conso_detail?.trim() || null : null`.

- [ ] **Step 2 : `AtelierForm.tsx`** — sous le champ Lieu : select « Public » (`tous`/`adultes`/`enfants`, défaut `tous`) piloté par `useState` ; champ « Âge minimum (optionnel) » affiché si public ≠ adultes ; case à cocher « Consommation sur place incluse dans le prix » (même style que la case « à la une ») pilotée par `useState`, avec champ « Détail conso » (placeholder « boisson chaude + pâtisserie incluses ») affiché si cochée. Transmettre dans `input` :

```ts
  public_cible: (fd.get("public_cible") ?? "tous") as PublicCible,
  age_minimum: fd.get("age_minimum") ? Number(fd.get("age_minimum")) : null,
  conso_incluse: fd.get("conso_incluse") === "on",
  conso_detail: String(fd.get("conso_detail") ?? ""),
```

- [ ] **Step 3 : `npx vitest run && npx eslint app/admin`** puis **Commit** — `feat(admin): champs public et consommation`

### Task 4 : Badges visiteur

**Files:**
- Modify: `components/AtelierCard.tsx`, `components/HeroAlaUne.tsx`, `app/ateliers/[id]/page.tsx`

- [ ] **Step 1 : `AtelierCard`** — dans le panneau déplié, au-dessus de la `<dl>`, ligne de chips :

```tsx
<div className="flex flex-wrap gap-1.5">
  <span className="chip bg-background text-ink">{publicCibleLabel(s.public_cible, s.age_minimum)}</span>
  {s.conso_incluse && <span className="chip bg-amber-soft text-ink">Conso incluse</span>}
</div>
```

- [ ] **Step 2 : `HeroAlaUne`** — dans le contenu bas de chaque slide, sous la ligne date/places, mêmes chips (fond `bg-surface/90 text-ink` pour rester lisible sur photo).

- [ ] **Step 3 : Page atelier** — ajouter deux `Info` dans la `<dl>` existante : `Info icon={Users} label="Public" value={publicCibleLabel(...)}` (remplacer l'actuel `Users`/Places par l'icône `UsersRound` pour Public ou garder `Users` pour Places et utiliser `Baby`/`HeartHandshake` pour Public — au choix, rester cohérent lucide). Si `conso_incluse`, ajouter `Info icon={Coffee} label="Sur place" value={s.conso_detail || "Consommation incluse"}`.

- [ ] **Step 4 : `npx eslint components app` + build rapide si doute** puis **Commit** — `feat: badges public et conso cote visiteur`

### Task 5 : Textes marketing

**Files:**
- Modify: `app/layout.tsx` (metadata), `app/page.tsx`, `components/Promesse.tsx`, `components/Faq.tsx`, `components/RestePrevenu.tsx`
- Modify (selon grep) : `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `components/auth/SignInForm.tsx`, `components/auth/SignUpForm.tsx`, `app/admin/AtelierForm.tsx` (placeholders « Écrire sa première histoire » → « Atelier bijoux en boulangerie »)

Angle : **« Crée de tes mains, repars avec ta création »** — bijoux, peinture façon Van Gogh (enfants), mosaïque, plateaux, textile ; lieux chaleureux (boulangeries, restaurants) ; petits & grands ; « chaque création raconte la tienne ».

- [ ] **Step 1 : `layout.tsx`**

```ts
export const metadata: Metadata = {
  title: "Atelier aux 100 histoires — Ateliers créatifs pour petits & grands",
  description:
    "Bijoux, peinture, mosaïque, textile… Crée de tes mains dans des lieux chaleureux (boulangeries, restaurants) et repars avec ta création. Réserve ton atelier.",
};
```

- [ ] **Step 2 : `page.tsx`** — eyebrow `Ateliers créatifs pour petits & grands` (les deux occurrences) ; fallback : sous-titre `Crée de tes mains, repars avec ta création.`

- [ ] **Step 3 : `Promesse.tsx`**

```tsx
import { Users, Gem, Croissant } from "lucide-react";

const POINTS = [
  { icon: Gem, text: "Tu repars avec ta création — bijou, tableau, mosaïque…" },
  { icon: Users, text: "Pour les petits comme pour les grands" },
  { icon: Croissant, text: "Des lieux chaleureux, parfois consommation incluse" },
];
```

H2 : `Crée de tes mains, repars avec ta création.`

- [ ] **Step 4 : `Faq.tsx`** — remplacer la liste :

```ts
const FAQ = [
  { q: "Faut-il être créatif ou avoir déjà pratiqué ?",
    a: "Pas du tout. Chaque atelier est guidé pas à pas, du choix des matériaux aux finitions. Débutant·e ou habitué·e, tu repars avec une création dont tu es fier·e." },
  { q: "Le matériel est-il fourni ?",
    a: "Oui, tout est compris dans le prix : matériaux, outils, et selon les ateliers les huiles, parfums ou matières à choisir sur place." },
  { q: "À partir de quel âge pour les enfants ?",
    a: "Chaque atelier indique son public : adultes, enfants (avec âge minimum) ou tous publics à vivre en famille. L'info est sur la fiche de chaque atelier." },
  { q: "La consommation sur place est-elle comprise ?",
    a: "Certains ateliers se déroulent en boulangerie ou restaurant et incluent une consommation dans le prix. C'est précisé sur la fiche de l'atelier." },
  { q: "Où ont lieu les ateliers ?",
    a: "Dans des lieux variés et chaleureux — boulangeries, restaurants, ateliers… L'adresse exacte est indiquée sur chaque atelier." },
  { q: "Puis-je annuler ma réservation ?",
    a: "Oui, contacte-nous au moins 48 h avant la séance pour être remboursé·e ou reporté·e sur une autre date." },
  { q: "Comment se passe le paiement ?",
    a: "Le paiement est 100 % sécurisé via Stripe, directement en ligne au moment de la réservation." },
];
```

- [ ] **Step 5 : `RestePrevenu.tsx`** — titre `Sois prévenu des prochains ateliers`, texte `Crée ton compte pour ne rater aucune date — bijoux, peinture, mosaïque…`.

- [ ] **Step 6 : Grep des résidus** — `rg -i "écriture|recit|récit|plume|histoire" app components lib` → réécrire chaque occurrence marketing restante (auth, etc.). « 100 histoires » dans le nom reste, et on peut l'assumer : *chaque création raconte la tienne*.

- [ ] **Step 7 : `npx eslint . && npx vitest run`** puis **Commit** — `feat(marketing): textes alignes sur les ateliers creatifs`

### Task 6 : Leads — migration, helpers purs (TDD), accès DB

**Files:**
- Create: `supabase/migrations/2026-06-09_leads_reduction.sql`, `lib/leads.shared.ts`, `lib/leads.shared.test.ts`, `lib/leads.ts`

- [ ] **Step 1 : Migration**

```sql
-- Capture email « réduction mystère » + consentement marketing (RGPD).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent boolean not null,
  consented_at timestamptz not null default now(),
  discount_pct int not null check (discount_pct in (5, 10, 15)),
  used_at timestamptz,
  created_at timestamptz not null default now()
);
-- Accès uniquement via la clé secrète serveur (aucune policy publique).
alter table public.leads enable row level security;
```

Appliquer via MCP Supabase (`apply_migration`, name `leads_reduction`).

- [ ] **Step 2 : Tests des helpers purs** (`lib/leads.shared.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { drawDiscount, normalizeEmail } from "./leads.shared";

describe("normalizeEmail", () => {
  it("minuscules + trim", () => expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com"));
});

describe("drawDiscount", () => {
  it("−5 % : 50 %", () => expect(drawDiscount(() => 0.0)).toBe(5));
  it("borne 0.49 → 5", () => expect(drawDiscount(() => 0.49)).toBe(5));
  it("−10 % : 40 %", () => expect(drawDiscount(() => 0.5)).toBe(10));
  it("borne 0.89 → 10", () => expect(drawDiscount(() => 0.89)).toBe(10));
  it("−15 % : 10 %", () => expect(drawDiscount(() => 0.95)).toBe(15));
});
```

- [ ] **Step 3 : run → FAIL**, puis **Step 4 : `lib/leads.shared.ts`**

```ts
/** Remises mystère possibles (en %). */
export type MysteryDiscount = 5 | 10 | 15;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Tirage pondéré : −5 % (50 %), −10 % (40 %), −15 % (10 %). */
export function drawDiscount(rand: () => number = Math.random): MysteryDiscount {
  const r = rand();
  if (r < 0.5) return 5;
  if (r < 0.9) return 10;
  return 15;
}
```

- [ ] **Step 5 : run → PASS**, puis **Step 6 : `lib/leads.ts`** (accès DB, pattern `bookings.ts`)

```ts
import "server-only";
import { createAdminClient } from "./supabase/server";
import { drawDiscount, normalizeEmail, type MysteryDiscount } from "./leads.shared";

/** Tire (ou retrouve) la remise mystère d'un email consenti. Idempotent. */
export async function claimMysteryDiscount(rawEmail: string): Promise<MysteryDiscount> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { data: existing, error: e1 } = await db
    .from("leads").select("discount_pct").eq("email", email).maybeSingle();
  if (e1) throw e1;
  if (existing) return existing.discount_pct as MysteryDiscount;

  const pct = drawDiscount();
  const { error } = await db.from("leads").insert({ email, consent: true, discount_pct: pct });
  if (error) {
    // Course (double envoi) : l'unique sur email a gagné — relire le tirage existant.
    const { data } = await db.from("leads").select("discount_pct").eq("email", email).maybeSingle();
    if (data) return data.discount_pct as MysteryDiscount;
    throw error;
  }
  return pct;
}

/** Remise active (consentie, jamais utilisée) pour un email, sinon null. */
export async function findActiveDiscount(rawEmail: string): Promise<MysteryDiscount | null> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { data, error } = await db
    .from("leads").select("discount_pct")
    .eq("email", email).eq("consent", true).is("used_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data?.discount_pct as MysteryDiscount | undefined) ?? null;
}

/** Marque la remise consommée (idempotent : ne touche que used_at nul). */
export async function markDiscountUsed(rawEmail: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const db = createAdminClient();
  const { error } = await db
    .from("leads").update({ used_at: new Date().toISOString() })
    .eq("email", email).is("used_at", null);
  if (error) throw error;
}
```

- [ ] **Step 7 : Commit** — `feat(leads): table et logique reduction mystere`

### Task 7 : API leads + pop-up

**Files:**
- Create: `app/api/leads/route.ts`, `app/api/leads/check/route.ts`, `components/MysteryPopup.tsx`
- Modify: `app/page.tsx` (montage)

- [ ] **Step 1 : `app/api/leads/route.ts`**

```ts
import { NextResponse } from "next/server";
import { claimMysteryDiscount } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, consent } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  if (consent !== true)
    return NextResponse.json(
      { error: "Le consentement est requis pour recevoir l'offre." },
      { status: 400 },
    );
  try {
    const pct = await claimMysteryDiscount(email);
    return NextResponse.json({ pct });
  } catch {
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie." }, { status: 500 });
  }
}
```

- [ ] **Step 2 : `app/api/leads/check/route.ts`** — même validation d'email ; répond `{ pct: number | null }` via `findActiveDiscount`, et `{ pct: null }` en cas d'erreur (ne bloque jamais la réservation, ne révèle rien d'autre).

- [ ] **Step 3 : `components/MysteryPopup.tsx`** — client. Comportement :
  - `localStorage["mystery_popup_v1"]` : `"dismissed"` ou `"claimed"` → ne plus afficher.
  - Déclenchement : premier de { 8 s écoulées, 30 % de scroll } (cleanup des listeners/timer).
  - `role="dialog" aria-modal="true"`, fermeture par croix et touche Échap ; overlay `bg-ink/40`.
  - Carte style maison (`rounded-card border-[1.5px] border-ink bg-surface shadow-lift`), icône `Gift`.
  - Étape formulaire : titre « Une réduction mystère t'attend 🎁 », texte « Laisse ton email et découvre ta remise (jusqu'à −15 %) sur ton prochain atelier. », champ email + case à cocher **obligatoire** : « J'accepte de recevoir par email les actualités et offres de l'Atelier aux 100 histoires. Désinscription possible à tout moment — [politique de confidentialité](/confidentialite). » Bouton désactivé tant que la case n'est pas cochée.
  - Soumission → POST `/api/leads` → étape révélation : « −X % sur ton prochain atelier ! » + « Ta remise sera appliquée automatiquement quand tu réserveras avec cet email. » → localStorage `claimed`.
  - Erreur réseau → message dans la pop-up, bouton réessayer.
  - Animation : `AnimatePresence` + `motion.div` (montée du bas), `EASE = [0.22, 1, 0.36, 1]` comme `AtelierCard`.

- [ ] **Step 4 : monter `<MysteryPopup />` à la fin de `app/page.tsx`** (accueil uniquement — jamais admin/merci/checkout par construction).

- [ ] **Step 5 : `npx eslint . && npx vitest run`**, test manuel rapide si possible, **Commit** — `feat: pop-up reduction mystere avec consentement`

### Task 8 : Remise auto au checkout + webhook + indice formulaire

**Files:**
- Modify: `lib/stripe.ts` (helper coupon), `app/api/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `app/ateliers/[id]/reserve-form.tsx`

- [ ] **Step 1 : `lib/stripe.ts`**

```ts
/** Garantit l'existence du coupon Stripe `mystere_<pct>` (création paresseuse). */
export async function ensureMysteryCoupon(pct: number): Promise<string> {
  const id = `mystere_${pct}`;
  try {
    await stripe.coupons.retrieve(id);
    return id;
  } catch (err) {
    if ((err as { code?: string }).code !== "resource_missing") throw err;
  }
  try {
    await stripe.coupons.create({
      id,
      percent_off: pct,
      duration: "once",
      name: `Réduction mystère -${pct}%`,
    });
  } catch (err) {
    // Course : déjà créé entre-temps — OK.
    if ((err as { code?: string }).code !== "resource_already_exists") throw err;
  }
  return id;
}
```

- [ ] **Step 2 : `app/api/checkout/route.ts`** — après `reserveSeats`, remplacer le calcul du montant :

```ts
    // Remise mystère éventuelle (la réservation prime : toute erreur → sans remise)
    let discounts: { coupon: string }[] | undefined;
    let pct = 0;
    const found = await findActiveDiscount(email).catch(() => null);
    if (found) {
      try {
        discounts = [{ coupon: await ensureMysteryCoupon(found) }];
        pct = found;
      } catch {
        discounts = undefined;
      }
    }
    const montant = Math.round((s.prix_cents * qty * (100 - pct)) / 100);
```

Et dans `stripe.checkout.sessions.create` : ajouter `discounts,` et dans `metadata` : `mystery_email: pct ? email : "", mystery_pct: String(pct)`.
(`discounts: undefined` est ignoré par Stripe ; ne PAS ajouter `allow_promotion_codes`, exclusif de `discounts`.)

- [ ] **Step 3 : `webhook/route.ts`** — dans `checkout.session.completed`, caster `event.data.object as { id: string; metadata?: Record<string, string> }` ; après `confirmBooking` réussi :

```ts
      const mysteryEmail = cs.metadata?.mystery_email;
      if (mysteryEmail) {
        try {
          await markDiscountUsed(mysteryEmail);
        } catch (e) {
          console.error("Echec marquage remise (non bloquant) :", e);
        }
      }
```

- [ ] **Step 4 : `reserve-form.tsx`** — état `const [discount, setDiscount] = useState<number | null>(null)` ; `onBlur` du champ email → POST `/api/leads/check` → `setDiscount(pct)`. Si `discount` :
  - sous l'email : `🎁 Ta remise mystère de −X % sera appliquée au paiement.` (style `text-sm font-medium text-success`)
  - total : `totalDu = Math.round((total * (100 - discount)) / 100)` — même formule que le serveur ; afficher l'ancien total barré + le nouveau, bouton `Payer {formatEUR(totalDu)}`.

- [ ] **Step 5 : `npx eslint . && npx vitest run`** puis **Commit** — `feat(checkout): remise mystere appliquee automatiquement`

### Task 9 : Vérification finale

- [ ] `npx vitest run` → tout vert
- [ ] `npx eslint .` → propre
- [ ] `npm run build` → succès
- [ ] `rg -i "écriture|récit|plume" app components lib` → zéro résidu marketing
- [ ] Commit final éventuel + récap des changements

## Auto-revue du plan

- **Couverture spec (chantiers 1–4)** : DB/admin (T1–T3), badges (T4), marketing (T5), pop-up+RGPD (T6–T7), remise checkout+webhook+indice (T8). Preuve sociale exclue à la demande de l'utilisateur. ✔
- **Placeholders** : aucun TBD ; le code clé est écrit. ✔
- **Cohérence des types** : `PublicCible`, `MysteryDiscount`, `publicCibleLabel`, `claimMysteryDiscount`, `findActiveDiscount`, `markDiscountUsed`, `ensureMysteryCoupon` — noms identiques entre tâches. ✔

# Refonte billetterie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter le parcours public (accueil → détail → achat → e-ticket → auth) au niveau de finition des inspirations fournies, en mobile-first et intuitif.

**Architecture:** App Router Next 16 (cette version diffère — lire `node_modules/next/dist/docs/` avant de coder). Logique pure isolée dans `lib/` (testée Vitest). Composants UI dans `components/`. Filtrage des jours côté client (données chargées en serveur). Auth via hooks Clerk custom. Aucune modif du contrat `/api/checkout`.

**Tech Stack:** Next 16.2.7, React 19, TypeScript, Tailwind v4 (`@theme` CSS-first), Vitest, Clerk 7 (hooks), Stripe, Supabase (admin client), Resend, framer-motion, lucide-react, **qrcode (à ajouter)**.

**Spec source:** `docs/superpowers/specs/2026-06-08-refonte-billetterie-design.md`

---

## File Structure

**Nouveaux fichiers**
- `lib/dates.ts` — helpers de regroupement/format par jour (+ `lib/dates.test.ts`)
- `lib/qr.ts` — wrapper QR (data URL) (+ `lib/qr.test.ts`)
- `components/CircleButton.tsx` — bouton rond icône (retour/partage)
- `components/DayStrip.tsx` — strip de jours scrollable (client)
- `components/SessionsBoard.tsx` — état du jour + DayStrip + liste (client)
- `components/AtelierCard.tsx` — carte atelier (vignette/dégradé, pastille date, arrow-fab)
- `components/StatChip.tsx` — mini-stat (icône + label + valeur)
- `components/AboutCollapse.tsx` — « À propos » + « Lire plus » (client)
- `components/Ticket.tsx` — e-ticket (encoches + perforation + QR)
- `components/SignInIncentive.tsx` — incitation compte post-achat (client)
- `components/auth/SignInForm.tsx` — formulaire connexion (hooks Clerk, client)
- `components/auth/SignUpForm.tsx` — formulaire inscription sans vérif (hooks Clerk, client)
- `app/ateliers/[id]/reserver/page.tsx` — page d'achat dédiée (serveur)
- `supabase/migrations/2026-06-08_session_image_url.sql` — migration

**Modifiés**
- `lib/types.ts` — `Session.image_url`
- `lib/ui.ts` — `weekdayShort`, déplacement de `formatDuree`
- `lib/bookings.ts` — `getBooking(id)`
- `app/globals.css` — classes `.day-pill .ticket .ticket-perf .ticket-notch .stat-chip .hero-band .sheet .circle-btn`
- `app/page.tsx` — accueil (bande colorée + SessionsBoard)
- `app/ateliers/[id]/page.tsx` — détail (hero band + stats + CTA collant)
- `app/ateliers/[id]/reserve-form.tsx` — split Prénom/Nom, restyle
- `app/merci/page.tsx` — serveur, ticket + incitation, fallback
- `app/sign-in/[[...sign-in]]/page.tsx` + `app/sign-up/[[...sign-up]]/page.tsx` — UI custom
- `app/styleguide/page.tsx` — aperçu des nouvelles classes
- `package.json` — dép `qrcode` + `@types/qrcode`

---

## Phase 0 — Préparation

### Task 0: Lire les docs Next + ajouter qrcode

**Files:** `package.json`

- [ ] **Step 1: Lire les conventions de cette version de Next**

Lire (Read tool) ces fichiers s'ils existent, sinon lister `node_modules/next/dist/docs/` :
- conventions `params`/`searchParams` (sont des `Promise` → `await`)
- middleware / `auth()` serveur (il n'existe PAS de `middleware.ts` source dans le repo)

Noter tout écart vs Next standard avant de coder l'auth et `/merci`.

- [ ] **Step 2: Installer qrcode**

Run: `npm i qrcode && npm i -D @types/qrcode`
Expected: `package.json` gagne `qrcode` (deps) + `@types/qrcode` (devDeps), install OK.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: ajoute qrcode pour le QR du e-ticket"
```

---

## Phase 1 — Fondations logiques (TDD)

### Task 1: Migration `sessions.image_url` + type

**Files:**
- Create: `supabase/migrations/2026-06-08_session_image_url.sql`
- Modify: `lib/types.ts`

- [ ] **Step 1: Écrire la migration SQL**

```sql
-- 2026-06-08_session_image_url.sql
alter table sessions add column if not exists image_url text;
comment on column sessions.image_url is 'URL de la photo hero de l''atelier (nullable).';
```

- [ ] **Step 2: Appliquer la migration**

Appliquer sur Supabase via le MCP `apply_migration` (name: `session_image_url`, query = SQL ci-dessus) OU coller le SQL dans le SQL editor du dashboard. Vérifier ensuite avec le MCP `list_tables` que `sessions.image_url` existe.

- [ ] **Step 3: Ajouter le champ au type**

Dans `lib/types.ts`, ajouter à `Session` (après `prix_cents`) :

```ts
  image_url: string | null;
```

(`lib/sessions.ts` fait `select("*")` → le champ remonte automatiquement, rien à changer.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (aucune erreur liée à `image_url`).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/2026-06-08_session_image_url.sql lib/types.ts
git commit -m "feat(db): colonne sessions.image_url nullable + type Session"
```

### Task 2: `lib/dates.ts` — regroupement par jour (TDD)

**Files:**
- Create: `lib/dates.ts`, `lib/dates.test.ts`

- [ ] **Step 1: Écrire les tests d'abord**

```ts
// lib/dates.test.ts
import { describe, it, expect } from "vitest";
import { dayKey, weekdayShort, groupByDay } from "./dates";
import type { Session } from "./types";

const mk = (id: string, iso: string): Session => ({
  id, titre: id, description: "", date_heure: iso, duree: 60, lieu: "Paris",
  capacite: 10, prix_cents: 3500, statut: "publie", places_reservees: 0,
  image_url: null, created_at: iso,
});

describe("dates", () => {
  it("dayKey = AAAA-MM-JJ en heure locale", () => {
    expect(dayKey("2026-06-09T14:30:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("weekdayShort renvoie un jour FR court sans point", () => {
    // 2026-06-13 est un samedi
    expect(weekdayShort("2026-06-13T10:00:00").toLowerCase()).toContain("sam");
  });

  it("groupByDay regroupe et trie par jour croissant", () => {
    const a = mk("a", "2026-06-13T10:00:00");
    const b = mk("b", "2026-06-09T10:00:00");
    const c = mk("c", "2026-06-13T18:00:00");
    const groups = groupByDay([a, b, c]);
    expect(groups.map((g) => g.key)).toEqual(["2026-06-09", "2026-06-13"]);
    // jour 2026-06-13 : a puis c (ordre d'insertion préservé)
    expect(groups[1].sessions.map((s) => s.id)).toEqual(["a", "c"]);
  });
});
```

- [ ] **Step 2: Lancer les tests (échec attendu)**

Run: `npm test -- dates`
Expected: FAIL (`Cannot find module './dates'`).

- [ ] **Step 3: Implémenter `lib/dates.ts`**

```ts
import type { Session } from "./types";

/** Clé de jour stable en heure locale : "AAAA-MM-JJ". */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

/** Jour de semaine FR court sans point final (ex. "sam"). */
export function weekdayShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("fr-FR", { weekday: "short" })
    .replace(".", "");
}

export type DayGroup = { key: string; sessions: Session[] };

/** Regroupe les sessions par jour, jours triés croissant (sessions déjà triées en amont). */
export function groupByDay(sessions: Session[]): DayGroup[] {
  const map = new Map<string, Session[]>();
  for (const s of sessions) {
    const k = dayKey(s.date_heure);
    (map.get(k) ?? map.set(k, []).get(k)!).push(s);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, sessions]) => ({ key, sessions }));
}
```

- [ ] **Step 4: Lancer les tests (succès attendu)**

Run: `npm test -- dates`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/dates.ts lib/dates.test.ts
git commit -m "feat(dates): regroupement des ateliers par jour (TDD)"
```

### Task 3: `lib/ui.ts` — `weekdayShort` réexport + `formatDuree` partagé

**Files:** Modify `lib/ui.ts`

- [ ] **Step 1: Déplacer `formatDuree` dans `lib/ui.ts`**

Ajouter à la fin de `lib/ui.ts` :

```ts
/** Durée en minutes → "1h30" / "45 min" / "2 h". */
export function formatDuree(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/ui.ts
git commit -m "refactor(ui): formatDuree partagé dans lib/ui"
```

### Task 4: `lib/qr.ts` — QR data URL (TDD)

**Files:** Create `lib/qr.ts`, `lib/qr.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
// lib/qr.test.ts
import { describe, it, expect } from "vitest";
import { qrDataUrl } from "./qr";

describe("qr", () => {
  it("génère un data URL PNG", async () => {
    const url = await qrDataUrl("ABC123");
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
```

- [ ] **Step 2: Lancer (échec attendu)**

Run: `npm test -- qr`
Expected: FAIL (`Cannot find module './qr'`).

- [ ] **Step 3: Implémenter `lib/qr.ts`**

```ts
import "server-only";
import QRCode from "qrcode";

/** QR encodé en data URL PNG (génération serveur, sans appel réseau). */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 240,
    color: { dark: "#111114", light: "#ffffff" },
  });
}
```

- [ ] **Step 4: Lancer (succès attendu)**

Run: `npm test -- qr`
Expected: PASS.

> Note : si `server-only` casse l'import sous Vitest, retirer la ligne `import "server-only";` (le module reste serveur par usage). Re-lancer.

- [ ] **Step 5: Commit**

```bash
git add lib/qr.ts lib/qr.test.ts package.json
git commit -m "feat(qr): wrapper QR data URL pour le e-ticket (TDD)"
```

### Task 5: `lib/bookings.ts` — `getBooking(id)`

**Files:** Modify `lib/bookings.ts`

- [ ] **Step 1: Ajouter la fonction** (calquée sur `getSession`, pas de test unitaire — IO, cohérent avec l'existant)

```ts
export async function getBooking(id: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/bookings.ts
git commit -m "feat(bookings): getBooking(id) pour la page ticket"
```

---

## Phase 2 — Design system (classes CSS)

### Task 6: Nouvelles classes dans `globals.css`

**Files:** Modify `app/globals.css` (dans `@layer components { … }`)

- [ ] **Step 1: Ajouter les classes** (avant la fermeture du `@layer components`)

```css
  /* Bande haute colorée + feuille blanche qui remonte (motif Image #4) */
  .hero-band { @apply relative -mx-4 px-4 pb-16; }
  .sheet { @apply relative -mt-10 rounded-t-[2rem] bg-surface px-4 pt-6; }

  /* Bouton rond icône (retour / partage) */
  .circle-btn {
    @apply inline-flex h-10 w-10 shrink-0 items-center justify-center
           rounded-full bg-white/90 text-ink shadow-soft backdrop-blur
           transition active:scale-95;
  }

  /* Pastille de jour (strip horizontal scrollable) */
  .day-pill {
    @apply flex shrink-0 flex-col items-center justify-center gap-0.5
           rounded-2xl border border-border bg-surface px-3.5 py-2
           text-center leading-none transition active:scale-95;
  }
  .day-pill[data-active="true"] { @apply border-transparent bg-ink text-on-ink; }

  /* Mini-stat (détail atelier) */
  .stat-chip {
    @apply flex flex-1 flex-col items-center gap-1 rounded-2xl
           border border-border bg-surface px-2 py-3 text-center;
  }

  /* E-ticket */
  .ticket {
    @apply relative overflow-visible rounded-card p-6 text-white shadow-lift;
    background-image: linear-gradient(150deg, #9aa2ff 0%, #6f7cf7 100%);
  }
  /* Rangée de perforation : pointillés + encoches demi-cercle des deux côtés */
  .ticket-perf { @apply relative my-5 h-0; }
  .ticket-perf::before {
    content: "";
    @apply absolute left-0 right-0 top-0 border-t-2 border-dashed border-white/45;
  }
  .ticket-notch {
    @apply absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full;
    background: var(--color-background);
  }
  .ticket-notch-left { @apply -left-9; }   /* -p-6 (24px) - r(12px) = -36px → -left-9 */
  .ticket-notch-right { @apply -right-9; }
```

> L'illusion de découpe exige que `.ticket-notch` ait la couleur du fond DERRIÈRE le ticket. Le ticket repose sur `--color-background` (fond app) → notches = `var(--color-background)`. La page `/merci` garde donc le fond app standard (le ticket périwinkle + blobs apportent la couleur).

- [ ] **Step 2: Aperçu visuel dans le styleguide**

Dans `app/styleguide/page.tsx`, ajouter une `<Section title="Ticket & jours">` avec un `.ticket` minimal (deux blocs + `.ticket-perf` + 2 `.ticket-notch`) et une rangée de 3 `.day-pill` (dont une `data-active="true"`). But : valider visuellement les encoches/pointillés.

- [ ] **Step 3: Vérifier visuellement**

Run: `npm run dev` puis ouvrir `/styleguide` (skill `run` ou Playwright MCP `browser_navigate` + `browser_take_screenshot`).
Expected: encoches rondes « creusées » des deux côtés + ligne pointillée nette ; pastilles de jour OK (active = noire).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/styleguide/page.tsx
git commit -m "feat(ui): classes ticket (encoches+perforation), day-pill, stat-chip, hero-band, sheet, circle-btn"
```

---

## Phase 3 — Accueil

### Task 7: `AtelierCard`

**Files:** Create `components/AtelierCard.tsx`

- [ ] **Step 1: Implémenter** (vignette image OU dégradé selon `image_url`)

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions";
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
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/30">
        {s.image_url ? (
          <Image src={s.image_url} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <span className="date-badge absolute inset-0 m-auto" aria-hidden />
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
```

> `next/image` avec URL externe nécessite d'autoriser le domaine dans `next.config.ts` (`images.remotePatterns`). Step 2 le couvre.

- [ ] **Step 2: Autoriser les images distantes**

Dans `next.config.ts`, ajouter (selon la convention lue au Task 0) :

```ts
images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
```

(Pour un MVP : `hostname: "**"`. Restreindre au bucket Supabase plus tard.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/AtelierCard.tsx next.config.ts
git commit -m "feat(home): AtelierCard (vignette image/dégradé + arrow-fab)"
```

### Task 8: `DayStrip` + `SessionsBoard`

**Files:** Create `components/DayStrip.tsx`, `components/SessionsBoard.tsx`

- [ ] **Step 1: `DayStrip`**

```tsx
"use client";
import { weekdayShort } from "@/lib/dates";
import { dayNumber } from "@/lib/ui";

export type DayOption = { key: string; iso: string };

export function DayStrip({
  days, active, onSelect,
}: {
  days: DayOption[];
  active: string; // "all" ou une key
  onSelect: (key: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrer par jour"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        role="tab"
        aria-selected={active === "all"}
        data-active={active === "all"}
        onClick={() => onSelect("all")}
        className="day-pill min-w-16"
      >
        <span className="text-[11px] font-bold uppercase opacity-70">Tous</span>
        <span className="font-display text-base font-extrabold">•</span>
      </button>
      {days.map((d) => (
        <button
          key={d.key}
          role="tab"
          aria-selected={active === d.key}
          data-active={active === d.key}
          onClick={() => onSelect(d.key)}
          className="day-pill min-w-16"
        >
          <span className="text-[11px] font-bold uppercase opacity-70">
            {weekdayShort(d.iso)}
          </span>
          <span className="font-display text-base font-extrabold">
            {dayNumber(d.iso)}
          </span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `SessionsBoard`** (état du jour + filtre + featured sur « Tous »)

```tsx
"use client";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/types";
import { groupByDay } from "@/lib/dates";
import { DayStrip, type DayOption } from "./DayStrip";
import { AtelierCard } from "./AtelierCard";
import { FeaturedSession } from "./FeaturedSession";
import { Stagger, StaggerItem } from "./motion";

export function SessionsBoard({ sessions }: { sessions: Session[] }) {
  const [active, setActive] = useState<string>("all");
  const groups = useMemo(() => groupByDay(sessions), [sessions]);
  const days: DayOption[] = groups.map((g) => ({ key: g.key, iso: g.sessions[0].date_heure }));

  const visible = active === "all"
    ? sessions
    : (groups.find((g) => g.key === active)?.sessions ?? []);

  const showFeatured = active === "all" && visible.length > 0;
  const [featured, ...rest] = visible;

  return (
    <div>
      <DayStrip days={days} active={active} onSelect={setActive} />
      <div className="sheet -mx-4 mt-4 min-h-[40vh] pb-2">
        {showFeatured && (
          <div className="mb-4">
            <FeaturedSession s={featured} />
          </div>
        )}
        <Stagger className="space-y-3">
          {(showFeatured ? rest : visible).map((s, i) => (
            <StaggerItem key={s.id}>
              <AtelierCard s={s} index={i + 1} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/DayStrip.tsx components/SessionsBoard.tsx
git commit -m "feat(home): DayStrip filtrant + SessionsBoard"
```

### Task 9: Recâbler `app/page.tsx`

**Files:** Modify `app/page.tsx`

- [ ] **Step 1: Remplacer le bloc liste par bande colorée + SessionsBoard**

Remplacer le contenu de la liste (le bloc `{sessions.length === 0 ? … featured + rest …}`) par :

```tsx
      {sessions.length === 0 ? (
        /* …garder l'état vide existant… */
      ) : (
        <Reveal delay={0.05} className="mt-6">
          <SessionsBoard sessions={sessions} />
        </Reveal>
      )}
```

Imports : retirer `FeaturedSession`/`SessionRow`/`Stagger`/`StaggerItem` s'ils ne servent plus ici, ajouter `import { SessionsBoard } from "@/components/SessionsBoard";`. Conserver l'en-tête (eyebrow + h1) et la section « Comment ça marche ».

> La bande colorée haute : envelopper l'en-tête (eyebrow + h1 + sous-titre) dans `<div className="hero-band tone-lavender rounded-b-[2rem]">`. `SessionsBoard` rend déjà sa `.sheet`.

- [ ] **Step 2: Vérifier visuellement**

Run: `npm run dev` → `/` (Playwright `browser_navigate` + screenshot).
Expected: bande lavande en haut, strip de jours, feuille blanche, cartes ; tap d'un jour filtre la liste ; « Tous » réaffiche tout.

- [ ] **Step 3: Lint + commit**

Run: `npm run lint`
```bash
git add app/page.tsx
git commit -m "feat(home): accueil refondu (bande colorée + filtre de jours)"
```

---

## Phase 4 — Détail atelier

### Task 10: `StatChip` + `AboutCollapse`

**Files:** Create `components/StatChip.tsx`, `components/AboutCollapse.tsx`

- [ ] **Step 1: `StatChip`**

```tsx
import type { LucideIcon } from "lucide-react";

export function StatChip({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="stat-chip">
      <Icon className="h-5 w-5 text-brand-ink" strokeWidth={1.8} aria-hidden />
      <span className="font-display text-sm font-extrabold leading-tight">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: `AboutCollapse`** (client, « Lire plus »)

```tsx
"use client";
import { useState } from "react";

export function AboutCollapse({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div>
      <p className={`mt-2 whitespace-pre-line leading-relaxed text-foreground/90 ${!open && long ? "line-clamp-4" : ""}`}>
        {text}
      </p>
      {long && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-sm font-bold text-brand-ink"
          aria-expanded={open}
        >
          {open ? "Lire moins" : "Lire plus"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` (PASS)
```bash
git add components/StatChip.tsx components/AboutCollapse.tsx
git commit -m "feat(détail): StatChip + AboutCollapse"
```

### Task 11: Refonte `app/ateliers/[id]/page.tsx` (hero band + stats + CTA collant)

**Files:** Modify `app/ateliers/[id]/page.tsx`

- [ ] **Step 1: Réécrire la page** (vitrine, le form part vers `/reserver`)

```tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { getSession, placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";
import { formatDateLong, dayNumber, monthShort, formatDuree } from "@/lib/ui";
import { Reveal, Floaty } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { StatChip } from "@/components/StatChip";
import { AboutCollapse } from "@/components/AboutCollapse";

export const dynamic = "force-dynamic";

export default async function AtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();

  const restantes = placesRestantes(s);
  const complet = restantes <= 0;

  return (
    <main className="screen pb-28">
      {/* Hero moitié-haute */}
      <div className="hero-band">
        <div className="relative -mx-4 h-64 overflow-hidden rounded-b-[2rem]">
          {s.image_url ? (
            <Image src={s.image_url} alt={s.titre} fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 tone-brand">
              <Floaty className="blob -right-12 -top-14 h-48 w-48 bg-white/25" />
              <Floaty className="blob -bottom-16 -left-12 h-44 w-44 bg-magenta/30" />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <CircleButton as="link" href="/" label="Retour"><ArrowLeft className="h-5 w-5" strokeWidth={2} /></CircleButton>
            <CircleButton as="link" href="/" label="Partager"><Share2 className="h-5 w-5" strokeWidth={2} /></CircleButton>
          </div>
        </div>
      </div>

      {/* Feuille de contenu */}
      <Reveal className="sheet -mt-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-brand-ink">{complet ? "Complet" : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}</p>
            <h1 className="mt-1 font-display text-[28px] leading-[1.1]">{s.titre}</h1>
            <p className="mt-1.5 capitalize text-muted">{formatDateLong(s.date_heure)}</p>
          </div>
          <div className="date-badge h-14 w-14">
            <span className="font-display text-xl font-extrabold text-ink">{dayNumber(s.date_heure)}</span>
            <span className="text-[10px] font-bold uppercase text-muted">{monthShort(s.date_heure)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <StatChip icon={Users} label="places" value={complet ? "0" : String(restantes)} />
          <StatChip icon={Clock} label="durée" value={s.duree ? formatDuree(s.duree) : "—"} />
          <StatChip icon={MapPin} label="lieu" value={s.lieu} />
        </div>

        {s.description && (
          <div className="mt-6">
            <h2 className="font-display text-xl">À propos de l&apos;atelier</h2>
            <AboutCollapse text={s.description} />
          </div>
        )}
      </Reveal>

      {/* CTA collant */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur">
        <div className="screen py-3">
          {complet ? (
            <Link href="/" className="btn-ghost w-full">Voir les autres ateliers</Link>
          ) : (
            <Link href={`/ateliers/${s.id}/reserver`} className="btn-primary h-14 w-full justify-between">
              <span>Réserver — {formatEUR(s.prix_cents)} / place</span>
              <span className="arrow-fab h-10 w-10 bg-white text-ink"><ArrowRight className="h-5 w-5" strokeWidth={1.8} /></span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Vérifier visuellement** (`npm run dev` → `/ateliers/<id réel>`)
Expected: hero, boutons ronds, 3 stats, « Lire plus » si description longue, CTA collant en bas.

- [ ] **Step 3: Lint + commit**
```bash
git add app/ateliers/[id]/page.tsx
git commit -m "feat(détail): vitrine immersive (hero band, stats, CTA collant)"
```

### Task 12: `CircleButton`

**Files:** Create `components/CircleButton.tsx`

> Créé AVANT le Task 11 à l'exécution (dépendance). Placé ici pour la lisibilité ; si tu suis l'ordre, fais ce task avant le 11.

- [ ] **Step 1: Implémenter** (polymorphe lien/bouton)

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Common = { label: string; children: ReactNode; className?: string };

export function CircleButton(
  props: Common & ({ as: "link"; href: string } | { as?: "button"; onClick?: () => void })
) {
  const cls = `circle-btn ${props.className ?? ""}`;
  if (props.as === "link") {
    return <Link href={props.href} aria-label={props.label} className={cls}>{props.children}</Link>;
  }
  return (
    <button type="button" aria-label={props.label} onClick={props.onClick} className={cls}>
      {props.children}
    </button>
  );
}
```

- [ ] **Step 2: Typecheck + commit**
Run: `npx tsc --noEmit` (PASS)
```bash
git add components/CircleButton.tsx
git commit -m "feat(ui): CircleButton (retour/partage)"
```

---

## Phase 5 — Achat

### Task 13: Page `/ateliers/[id]/reserver` + form Prénom/Nom

**Files:**
- Create: `app/ateliers/[id]/reserver/page.tsx`
- Modify/replace: `app/ateliers/[id]/reserve-form.tsx`

- [ ] **Step 1: Page serveur**

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession, placesRestantes } from "@/lib/sessions";
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
        <CircleButton as="link" href={`/ateliers/${s.id}`} label="Retour"><ArrowLeft className="h-5 w-5" strokeWidth={2} /></CircleButton>
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
```

- [ ] **Step 2: Réécrire `reserve-form.tsx`** (Prénom + Nom séparés, CTA collant, concat `nom`)

Remplacer entièrement le fichier par une version avec deux champs `prenom`/`nom`, le stepper existant, et au submit : `nom: \`${prenom} ${nom}\`.trim()` dans le body POST `/api/checkout` (le reste — email, nb_places, redirection `data.url`, gestion erreurs — identique à l'actuel). Le bouton final devient collant :

```tsx
      {/* …champs Prénom, Nom, Email, stepper (mêmes classes .field/.field-label) … */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur">
        <div className="screen py-3">
          <button className="btn-primary h-14 w-full" disabled={loading}>
            {loading ? (<><Loader2 className="h-5 w-5 animate-spin" /> Redirection…</>)
                     : (<><Lock className="h-4 w-4" strokeWidth={1.8} /> Payer {formatEUR(total)}</>)}
          </button>
        </div>
      </div>
```

Champs ajoutés (au-dessus de l'email) :

```tsx
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
```

Submit (extrait) :

```tsx
      const prenom = String(fd.get("prenom") ?? "").trim();
      const nom = String(fd.get("nom") ?? "").trim();
      // …
      body: JSON.stringify({ sessionId, nb_places: qty, nom: `${prenom} ${nom}`.trim(), email: fd.get("email") }),
```

- [ ] **Step 3: Vérifier le flux** (`npm run dev` → détail → « Réserver » → form → Stripe test)
Expected: redirection Stripe ; après paiement test, retour `/merci?b=…`.

- [ ] **Step 4: Lint + commit**
```bash
git add "app/ateliers/[id]/reserver/page.tsx" "app/ateliers/[id]/reserve-form.tsx"
git commit -m "feat(achat): page de réservation dédiée + Prénom/Nom séparés"
```

---

## Phase 6 — E-Ticket + incitation compte

### Task 14: `Ticket`

**Files:** Create `components/Ticket.tsx`

- [ ] **Step 1: Implémenter** (reçoit booking + session + dataUrl QR déjà généré côté serveur)

```tsx
import Image from "next/image";
import type { Booking, Session } from "@/lib/types";
import { formatEUR } from "@/lib/money";
import { formatDateLong } from "@/lib/ui";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-0.5 font-display text-base font-extrabold">{value}</p>
    </div>
  );
}

export function Ticket({ b, s, qr }: { b: Booking; s: Session; qr: string }) {
  const d = new Date(s.date_heure);
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const ref = b.id.slice(0, 8).toUpperCase();

  return (
    <div className="ticket">
      <div className="relative h-36 overflow-hidden rounded-2xl bg-white/20">
        {s.image_url && <Image src={s.image_url} alt="" fill sizes="100vw" className="object-cover" />}
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-white/70">Atelier des 100 histoires</p>
      <h1 className="mt-1 font-display text-2xl leading-tight">{s.titre}</h1>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Field label="Date" value={new Date(s.date_heure).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} />
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

      <div className="flex items-center justify-center">
        <div className="rounded-2xl bg-white p-3">
          <Image src={qr} alt={`QR de la réservation ${ref}`} width={140} height={140} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**
Run: `npx tsc --noEmit` (PASS)
```bash
git add components/Ticket.tsx
git commit -m "feat(ticket): composant e-ticket (encoches + perforation + QR)"
```

### Task 15: `SignInIncentive`

**Files:** Create `components/SignInIncentive.tsx`

- [ ] **Step 1: Implémenter** (variante connecté / non connecté)

```tsx
import Link from "next/link";
import { UserPlus, BellRing } from "lucide-react";

export function SignInIncentive({ signedIn, email }: { signedIn: boolean; email: string }) {
  if (signedIn) {
    return (
      <div className="card mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success"><BellRing className="h-5 w-5" /></span>
        <p className="text-sm font-medium">Tu retrouveras ce billet dans ton espace, et tu seras informé·e des prochains ateliers.</p>
      </div>
    );
  }
  return (
    <div className="card mt-5 tone-lime">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink"><UserPlus className="h-5 w-5" /></span>
        <div>
          <p className="font-display text-lg">Garde tes billets à portée</p>
          <p className="mt-1 text-sm text-ink/80">Crée ton compte pour retrouver tes billets et être informé·e des prochains ateliers.</p>
        </div>
      </div>
      <Link href={`/sign-up?email=${encodeURIComponent(email)}`} className="btn-primary mt-4 w-full">
        Créer mon compte
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**
Run: `npx tsc --noEmit` (PASS)
```bash
git add components/SignInIncentive.tsx
git commit -m "feat(merci): SignInIncentive (création de compte post-achat)"
```

### Task 16: Refonte `app/merci/page.tsx` (serveur, ticket + fallback)

**Files:** Modify `app/merci/page.tsx`

- [ ] **Step 1: Réécrire en server component**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getBooking } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { qrDataUrl } from "@/lib/qr";
import { Pop } from "@/components/motion";
import { Ticket } from "@/components/Ticket";
import { SignInIncentive } from "@/components/SignInIncentive";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réservation confirmée — Atelier des 100 histoires" };

export default async function Merci({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const { b } = await searchParams;
  const booking = b ? await getBooking(b) : null;
  const session = booking ? await getSession(booking.session_id) : null;

  // Fallback gracieux (lien direct, booking introuvable…)
  if (!booking || !session) {
    return (
      <main className="screen py-12">
        <div className="card text-center">
          <h1 className="font-display text-2xl">Réservation confirmée&nbsp;!</h1>
          <p className="mt-2 text-muted">Un email de confirmation t&apos;a été envoyé.</p>
          <Link href="/" className="btn-primary mt-6 w-full">Découvrir d&apos;autres ateliers</Link>
        </div>
      </main>
    );
  }

  const qr = await qrDataUrl(booking.id);
  const { userId } = await auth();

  return (
    <main className="screen py-8 pb-12">
      <Pop>
        <Ticket b={booking} s={session} qr={qr} />
      </Pop>
      <SignInIncentive signedIn={!!userId} email={booking.email} />
      <Link href="/" className="btn-ghost mt-4 w-full justify-between">
        Découvrir d&apos;autres ateliers
        <span className="arrow-fab h-10 w-10"><ArrowRight className="h-5 w-5" strokeWidth={1.8} /></span>
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Vérifier** (`npm run dev`, ouvrir `/merci?b=<id booking réel>`)
Expected: ticket complet (encoches, QR scannable → contient l'id), incitation compte si déconnecté. `/merci` sans `b` → fallback.

- [ ] **Step 3: Lint + commit**
```bash
git add app/merci/page.tsx
git commit -m "feat(merci): e-ticket + incitation compte (fallback si booking absent)"
```

---

## Phase 7 — Auth UI custom (sans vérification)

### Task 17: Config instance Clerk — désactiver la vérification email

**Files:** (config externe, pas de fichier)

- [ ] **Step 1: Désactiver « require email verification »**

Via le skill `clerk-cli` (ou dashboard Clerk → User & Authentication → Email, Phone, Username → Email address → décocher « Verify at sign-up »), de sorte que `signUp.create` revienne `status: "complete"` sans étape de code. Activer email + password.

- [ ] **Step 2: Vérifier** que l'instance autorise l'inscription email+mot de passe sans vérif (note le résultat ; le code du Task 19 gère le cas contraire avec un message).

### Task 18: `SignInForm`

**Files:** Create `components/auth/SignInForm.tsx`

- [ ] **Step 1: Implémenter** (hooks Clerk, états chargement/erreur, a11y)

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await signIn.create({
        identifier: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/");
      } else {
        setError("Connexion incomplète. Réessaie.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(messageFromClerk(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {error && <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
      <button className="btn-primary h-14 w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Connexion…</> : "Se connecter"}
      </button>
    </form>
  );
}

function messageFromClerk(err: unknown): string {
  const e = err as { errors?: { message?: string; longMessage?: string }[] };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Identifiants invalides.";
}
```

- [ ] **Step 2: Typecheck + commit**
Run: `npx tsc --noEmit` (PASS)
```bash
git add components/auth/SignInForm.tsx
git commit -m "feat(auth): SignInForm custom (hooks Clerk)"
```

### Task 19: `SignUpForm` (sans vérification, email pré-rempli)

**Files:** Create `components/auth/SignUpForm.tsx`

- [ ] **Step 1: Implémenter**

```tsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const prefillEmail = useSearchParams().get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await signUp.create({
        emailAddress: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/");
      } else {
        // L'instance impose encore une étape (ex. vérification non désactivée).
        setError("Inscription incomplète : vérifie la configuration (vérification email à désactiver).");
        setLoading(false);
      }
    } catch (err: unknown) {
      const e2 = err as { errors?: { message?: string; longMessage?: string }[] };
      setError(e2?.errors?.[0]?.longMessage ?? e2?.errors?.[0]?.message ?? "Inscription impossible.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={prefillEmail} className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} className="field" />
      </div>
      {error && <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
      <button className="btn-primary h-14 w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Création…</> : "Créer mon compte"}
      </button>
    </form>
  );
}
```

> Clerk peut ajouter un challenge bot (CAPTCHA). Si l'instance l'exige, ajouter `<div id="clerk-captcha" />` dans le form (Clerk l'utilise pour le widget). À vérifier au run.

- [ ] **Step 2: Typecheck + commit**
Run: `npx tsc --noEmit` (PASS)
```bash
git add components/auth/SignUpForm.tsx
git commit -m "feat(auth): SignUpForm custom sans vérification (email pré-rempli)"
```

### Task 20: Brancher les pages auth (moitié colorée)

**Files:** Modify `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Page sign-in**

Remplacer `<SignIn …/>` par `<SignInForm />` ; conserver l'en-tête, envelopper dans une bande colorée :

```tsx
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";

export const metadata = { title: "Connexion — Atelier des 100 histoires" };

export default function SignInPage() {
  return (
    <main className="screen py-10">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-on-ink shadow-lift"><Sparkles className="h-7 w-7" strokeWidth={2.4} /></span>
          <h1 className="mt-4 font-display text-3xl">Content de te revoir</h1>
          <p className="mt-2 text-muted">Connecte-toi avec ton email.</p>
        </div>
      </Reveal>
      <Reveal delay={0.08} className="mt-6"><SignInForm /></Reveal>
      <p className="mt-4 text-center text-sm text-muted">
        Pas encore de compte ? <Link href="/sign-up" className="font-bold text-brand-ink">Créer un compte</Link>
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Page sign-up** — idem avec `<SignUpForm />` et lien vers `/sign-in`. **`SignUpForm` utilise `useSearchParams` → l'envelopper dans `<Suspense>`** :

```tsx
import { Suspense } from "react";
// …
<Reveal delay={0.08} className="mt-6">
  <Suspense fallback={<div className="card h-64 animate-pulse" />}>
    <SignUpForm />
  </Suspense>
</Reveal>
```

- [ ] **Step 3: Vérifier le flux complet** (`npm run dev`)
Inscription depuis `/merci` → `/sign-up?email=…` (email pré-rempli) → compte créé sans code → connecté. Puis `/sign-in`.

- [ ] **Step 4: Lint + commit**
```bash
git add "app/sign-in/[[...sign-in]]/page.tsx" "app/sign-up/[[...sign-up]]/page.tsx"
git commit -m "feat(auth): pages connexion/inscription en UI custom (moitié colorée)"
```

---

## Phase 8 — Vérification globale & Audit UX

### Task 21: Build + parcours complet

- [ ] **Step 1: Suite de tests**
Run: `npm test` → Expected: PASS (money, dates, qr).
- [ ] **Step 2: Lint + typecheck + build**
Run: `npm run lint` ; `npx tsc --noEmit` ; `npm run build` → Expected: succès.
- [ ] **Step 3: Parcours bout-en-bout** (Playwright MCP) : accueil → filtre jour → détail → réserver → Stripe test → `/merci` (ticket + QR) → créer compte → connecté. Screenshot de chaque écran.
- [ ] **Step 4: Commit** (si correctifs)
```bash
git add -A && git commit -m "fix: correctifs vérification de parcours"
```

### Task 22: Audit UX (skills mastepanoski)

- [ ] **Step 1: Demander l'accord** d'installer les skills tiers, puis :
Run: `npx skills add mastepanoski/claude-skills --skill ux-audit-rethink` (+ `nielsen-heuristics-audit`, `wcag-accessibility-audit`, `don-norman-principles-audit`, `ui-design-review`).
- [ ] **Step 2: Lancer chaque audit** sur les écrans livrés (captures Playwright + code). Collecter findings + sévérités.
- [ ] **Step 3: Corriger par ordre de sévérité** (0–4), prioriser bloquants/critiques (contraste AA, labels, focus, ordre de lecture, retours d'état).
- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "fix(a11y/ux): corrections issues de l'audit UX"
```

---

## Self-Review (couverture spec)

- §4.1 Accueil → Tasks 7–9 ✅ · §4.2 Détail → Tasks 10–12 ✅ · §4.3 Achat → Task 13 ✅
- §4.4 Ticket+incitation → Tasks 14–16 ✅ · §4.5 Auth → Tasks 17–20 ✅
- §3 Data (`image_url`, pas de migration booking, `nom` concaténé) → Tasks 1, 13 ✅
- §6 Perforation → Task 6 ✅ · §7 Audit → Task 22 ✅ · §8 Points Next/Clerk → Tasks 0, 17 ✅
- Types cohérents : `groupByDay`/`DayGroup`/`DayOption`, `qrDataUrl`, `getBooking`, `Ticket({b,s,qr})`, `SignInIncentive({signedIn,email})` utilisés tels que définis.

## Ordre d'exécution recommandé
0 → 1 → 2 → 3 → 4 → 5 → 6 → 12 (CircleButton) → 7 → 8 → 9 → 10 → 11 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22.

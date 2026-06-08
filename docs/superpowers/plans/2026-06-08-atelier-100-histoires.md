# Atelier des 100 histoires — Plan d'implémentation (Phase 1 MVP)

> **Pour l'agent :** exécuter tâche par tâche. Cases `- [ ]` à cocher au fur et à mesure.
> Design system déjà en place (`design-system/MASTER.md`, `app/globals.css`). Spec : `docs/superpowers/specs/2026-06-08-atelier-100-histoires-design.md`.

**Goal :** Vendre des places sur des ateliers de groupe planifiés, paiement Stripe, emails de confirmation, mini back-office, le tout mobile-first.

**Architecture :** Next.js 16 (App Router) sur Vercel. Données dans Supabase Postgres (accès serveur uniquement via clé secrète). Auth Clerk (comptes optionnels phase 2 + protection `/admin`). Paiement via Stripe Checkout + webhook. Emails via Resend.

**Tech Stack :** Next.js 16, TypeScript, Tailwind v4, @supabase/supabase-js, stripe, resend, @clerk/nextjs, Vitest (tests unitaires).

---

## Structure des fichiers

```
lib/
  supabase/server.ts   — client admin Supabase (clé secrète)
  money.ts             — formatage/conversion EUR
  types.ts             — types Session, Booking, enums
  sessions.ts          — lecture des ateliers (repository)
  bookings.ts          — création/confirmation/annulation des réservations
  stripe.ts            — client Stripe + helpers checkout
  email.ts             — envois Resend (confirmation + notif organisateur)
  admin.ts             — garde d'accès admin (allowlist Clerk)
app/
  page.tsx                       — accueil + liste ateliers publiés
  ateliers/[id]/page.tsx         — détail atelier + formulaire de réservation
  ateliers/[id]/reserve-form.tsx — formulaire client (qty, nom, email)
  merci/page.tsx                 — confirmation après paiement
  api/checkout/route.ts          — réserve atomiquement + crée la session Stripe
  api/stripe/webhook/route.ts    — confirme/annule + emails
  admin/layout.tsx               — garde admin + shell
  admin/page.tsx                 — liste des ateliers (vendues/restantes)
  admin/ateliers/nouveau/page.tsx + actions.ts — créer/éditer (Server Actions)
  admin/ateliers/[id]/inscrits/page.tsx + export — inscrits + CSV
  (legal)/mentions-legales|cgv|confidentialite/page.tsx — gabarits
supabase/migrations/0001_init.sql — schéma + RPC
```

---

## Task 0 : Outillage de test (Vitest)

**Files:** Create `vitest.config.ts`, `package.json` (modify scripts)

- [ ] **Step 1 :** Installer Vitest
```bash
npm install -D vitest
```
- [ ] **Step 2 :** Créer `vitest.config.ts`
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["lib/**/*.test.ts"] } });
```
- [ ] **Step 3 :** Ajouter le script de test dans `package.json` → `"test": "vitest run"`, `"test:watch": "vitest"`
- [ ] **Step 4 :** Vérifier
```bash
npm test
```
Expected : « No test files found » (0 test) — l'outil tourne.
- [ ] **Step 5 :** Commit `chore: add vitest`

---

## Task 1 : Helper monétaire (TDD)

**Files:** Create `lib/money.ts`, `lib/money.test.ts`

- [ ] **Step 1 — test qui échoue** (`lib/money.test.ts`)
```ts
import { describe, it, expect } from "vitest";
import { formatEUR, euroToCents } from "./money";

describe("money", () => {
  it("formate des centimes en euros FR", () => {
    expect(formatEUR(3500)).toBe("35,00 €");
    expect(formatEUR(0)).toBe("0,00 €");
  });
  it("convertit euros -> centimes", () => {
    expect(euroToCents(35)).toBe(3500);
    expect(euroToCents(12.5)).toBe(1250);
  });
});
```
- [ ] **Step 2 :** `npm test` → FAIL (module introuvable)
- [ ] **Step 3 — implémentation** (`lib/money.ts`)
```ts
export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
    .format(cents / 100);
}
export function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}
```
- [ ] **Step 4 :** `npm test` → PASS
- [ ] **Step 5 :** Commit `feat: euro money helpers`

> Note : `Intl` rend l'espace insécable avant `€`. Si un test diffère sur l'espace, comparer avec `.replace(/ | /g, " ")`.

---

## Task 2 : Schéma Supabase + RPC atomique

**Files:** Create `supabase/migrations/0001_init.sql`

- [ ] **Step 1 — écrire la migration**
```sql
-- Enums
create type session_status as enum ('brouillon', 'publie', 'annule');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

-- Ateliers
create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  titre            text not null,
  description      text not null default '',
  date_heure       timestamptz not null,
  duree            int not null default 120,         -- minutes
  lieu             text not null default '',
  capacite         int not null check (capacite > 0),
  prix_cents       int not null check (prix_cents >= 0),
  statut           session_status not null default 'brouillon',
  places_reservees int not null default 0 check (places_reservees >= 0),
  created_at       timestamptz not null default now()
);

-- Réservations
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete restrict,
  clerk_user_id     text,
  email             text not null,
  nom               text not null,
  nb_places         int not null check (nb_places > 0),
  montant_cents     int not null,
  statut            booking_status not null default 'pending',
  stripe_session_id text unique,
  created_at        timestamptz not null default now()
);
create index on public.bookings(session_id);
create index on public.bookings(stripe_session_id);

-- RLS activé ; aucun accès anon (tout passe par le serveur avec la clé secrète)
alter table public.sessions enable row level security;
alter table public.bookings enable row level security;

-- Réservation ATOMIQUE de places : renvoie true si OK, false si plus de place
create or replace function public.reserve_seats(p_session_id uuid, p_qty int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare ok uuid;
begin
  update sessions
  set places_reservees = places_reservees + p_qty
  where id = p_session_id
    and statut = 'publie'
    and places_reservees + p_qty <= capacite
  returning id into ok;
  return ok is not null;
end;
$$;

-- Libération de places (panier abandonné / paiement échoué)
create or replace function public.release_seats(p_session_id uuid, p_qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update sessions
  set places_reservees = greatest(0, places_reservees - p_qty)
  where id = p_session_id;
end;
$$;
```
- [ ] **Step 2 — appliquer** : via l'outil Supabase MCP `apply_migration` (name `init`, project ref `lnqnqwbwlatiehhgxjhq`) OU coller le SQL dans Supabase → SQL Editor.
- [ ] **Step 3 — vérifier** : `list_tables` (MCP) montre `sessions` + `bookings` ; tester en SQL :
```sql
insert into sessions (titre, date_heure, capacite, prix_cents, statut)
values ('Test', now() + interval '7 day', 2, 3500, 'publie');
select reserve_seats((select id from sessions limit 1), 2); -- true
select reserve_seats((select id from sessions limit 1), 1); -- false (complet)
```
- [ ] **Step 4 :** Commit `feat: db schema + atomic seat RPCs`

---

## Task 3 : Client Supabase serveur + types

**Files:** Create `lib/supabase/server.ts`, `lib/types.ts`

- [ ] **Step 1 — types** (`lib/types.ts`)
```ts
export type SessionStatus = "brouillon" | "publie" | "annule";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Session = {
  id: string; titre: string; description: string; date_heure: string;
  duree: number; lieu: string; capacite: number; prix_cents: number;
  statut: SessionStatus; places_reservees: number; created_at: string;
};
export type Booking = {
  id: string; session_id: string; clerk_user_id: string | null;
  email: string; nom: string; nb_places: number; montant_cents: number;
  statut: BookingStatus; stripe_session_id: string | null; created_at: string;
};
```
- [ ] **Step 2 — client** (`lib/supabase/server.ts`)
```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```
- [ ] **Step 3 :** Installer le garde-fou `server-only` → `npm install server-only`
- [ ] **Step 4 :** `npm run build` → PASS
- [ ] **Step 5 :** Commit `feat: supabase server client + types`

---

## Task 4 : Repository ateliers (lecture)

**Files:** Create `lib/sessions.ts`

- [ ] **Step 1** (`lib/sessions.ts`)
```ts
import "server-only";
import { createAdminClient } from "./supabase/server";
import type { Session } from "./types";

export async function listPublishedSessions(): Promise<Session[]> {
  const db = createAdminClient();
  const { data, error } = await db.from("sessions").select("*")
    .eq("statut", "publie").gte("date_heure", new Date().toISOString())
    .order("date_heure", { ascending: true });
  if (error) throw error;
  return data as Session[];
}

export async function getSession(id: string): Promise<Session | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Session | null;
}

export function placesRestantes(s: Session): number {
  return Math.max(0, s.capacite - s.places_reservees);
}
```
- [ ] **Step 2 :** `npm run build` → PASS
- [ ] **Step 3 :** Commit `feat: sessions repository`

---

## Task 4b : Shell de l'app (header + footer)

**Files:** Create `components/Header.tsx`, `components/Footer.tsx`; Modify `app/layout.tsx`

- [ ] **Step 1 — Header** : logo texte « Atelier des 100 histoires » (lien `/`) à gauche ; à droite, `<SignInButton>`/`<SignUpButton>` si déconnecté, `<UserButton>` si connecté (composants `@clerk/nextjs`). Sticky en haut, fond `surface`, ombre `shadow-soft`.
- [ ] **Step 2 — Footer** : liens vers `/mentions-legales`, `/cgv`, `/confidentialite` + mention « © Atelier des 100 histoires ». Texte `text-muted`, centré.
- [ ] **Step 3 — Layout** : insérer `<Header/>` avant `{children}` et `<Footer/>` après, dans `app/layout.tsx` (à l'intérieur du `ClerkProvider`). Le `<main>` des pages reste en `.screen`.
- [ ] **Step 4 :** `npm run build` → PASS
- [ ] **Step 5 :** Commit `feat: app shell (header + footer)`

---

## Task 5 : Accueil — atelier vedette + liste « À venir »

**Files:** Create `components/FeaturedSession.tsx`, `components/SessionRow.tsx`; Modify `app/page.tsx`

Disposition retenue : **le 1er atelier (le plus proche) est mis en avant** dans une grande carte
colorée (fond `brand` ou `magenta-soft`) avec date/lieu/prix + bouton « Réserver » ; les ateliers
suivants apparaissent en **liste compacte** (`SessionRow` : date · titre · prix · places), chacun
cliquable vers `/ateliers/[id]`. `SessionCard` (carte standard) reste utilisable ailleurs.

- [ ] **Step 1 — carte** (`components/SessionCard.tsx`)
```tsx
import Link from "next/link";
import type { Session } from "@/lib/types";
import { placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";

export function SessionCard({ s }: { s: Session }) {
  const restantes = placesRestantes(s);
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
  return (
    <Link href={`/ateliers/${s.id}`} className="card block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl">{s.titre}</h3>
          <p className="text-sm text-muted">{date} · {s.lieu}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl">{formatEUR(s.prix_cents)}</p>
          <p className="text-xs text-muted">par place</p>
        </div>
      </div>
      <div className="mt-4">
        <span className={`chip ${restantes > 0 ? "bg-brand-soft text-ink" : "bg-magenta-soft text-ink"}`}>
          {restantes > 0 ? `${restantes} places restantes` : "Complet"}
        </span>
      </div>
    </Link>
  );
}
```
- [ ] **Step 2 — page** (`app/page.tsx`)
```tsx
import { listPublishedSessions } from "@/lib/sessions";
import { SessionCard } from "@/components/SessionCard";

export const dynamic = "force-dynamic"; // données fraîches

export default async function Home() {
  const sessions = await listPublishedSessions();
  return (
    <main className="screen py-8">
      <span className="chip bg-brand-soft text-ink">Ateliers</span>
      <h1 className="mt-3 text-3xl leading-tight">Atelier des 100 histoires</h1>
      <p className="mt-2 text-muted">Réservez votre place à nos prochains ateliers.</p>
      <div className="mt-6 space-y-4">
        {sessions.length === 0
          ? <p className="text-muted">Aucun atelier programmé pour le moment.</p>
          : sessions.map((s) => <SessionCard key={s.id} s={s} />)}
      </div>
    </main>
  );
}
```
- [ ] **Step 3 :** `npm run build` → PASS. Vérif visuelle dev (`/`).
- [ ] **Step 4 :** Commit `feat: home page with sessions list`

---

## Task 6 : Détail atelier + formulaire de réservation

**Files:** Create `app/ateliers/[id]/page.tsx`, `app/ateliers/[id]/reserve-form.tsx`

- [ ] **Step 1 — formulaire client** (`reserve-form.tsx`)
```tsx
"use client";
import { useState } from "react";

export function ReserveForm({ sessionId, max }: { sessionId: string; max: number }) {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId, nb_places: Number(fd.get("nb_places")),
        nom: fd.get("nom"), email: fd.get("email"),
      }),
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; }
    else { alert(data.error ?? "Erreur"); setLoading(false); }
  }
  return (
    <form onSubmit={onSubmit} className="card mt-4 space-y-3">
      <label className="block text-sm font-medium">Nom
        <input name="nom" required className="mt-1 w-full rounded-lg border border-border px-3 py-3" />
      </label>
      <label className="block text-sm font-medium">Email
        <input name="email" type="email" required inputMode="email"
               className="mt-1 w-full rounded-lg border border-border px-3 py-3" />
      </label>
      <label className="block text-sm font-medium">Nombre de places
        <input name="nb_places" type="number" min={1} max={max} defaultValue={1} required
               className="mt-1 w-full rounded-lg border border-border px-3 py-3" />
      </label>
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Redirection…" : "Réserver et payer"}
      </button>
    </form>
  );
}
```
- [ ] **Step 2 — page détail** (`app/ateliers/[id]/page.tsx`)
```tsx
import { notFound } from "next/navigation";
import { getSession, placesRestantes } from "@/lib/sessions";
import { formatEUR } from "@/lib/money";
import { ReserveForm } from "./reserve-form";

export const dynamic = "force-dynamic";

export default async function AtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s || s.statut !== "publie") notFound();
  const restantes = placesRestantes(s);
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
  return (
    <main className="screen py-8">
      <h1 className="text-3xl leading-tight">{s.titre}</h1>
      <p className="mt-2 text-muted">{date} · {s.lieu}</p>
      <p className="mt-1 text-2xl">{formatEUR(s.prix_cents)} <span className="text-sm text-muted">/ place</span></p>
      <p className="mt-4 whitespace-pre-line">{s.description}</p>
      {restantes > 0
        ? <ReserveForm sessionId={s.id} max={restantes} />
        : <p className="mt-4 chip bg-magenta-soft text-ink">Atelier complet</p>}
    </main>
  );
}
```
- [ ] **Step 3 :** `npm run build` → PASS
- [ ] **Step 4 :** Commit `feat: atelier detail + reserve form`

---

## Task 7 : Repository réservations

**Files:** Create `lib/bookings.ts`

- [ ] **Step 1** (`lib/bookings.ts`)
```ts
import "server-only";
import { createAdminClient } from "./supabase/server";
import type { Booking } from "./types";

export async function reserveSeats(sessionId: string, qty: number): Promise<boolean> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("reserve_seats", { p_session_id: sessionId, p_qty: qty });
  if (error) throw error;
  return data === true;
}
export async function releaseSeats(sessionId: string, qty: number): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.rpc("release_seats", { p_session_id: sessionId, p_qty: qty });
  if (error) throw error;
}
export async function createPendingBooking(b: {
  session_id: string; email: string; nom: string; nb_places: number;
  montant_cents: number; clerk_user_id: string | null;
}): Promise<Booking> {
  const db = createAdminClient();
  const { data, error } = await db.from("bookings")
    .insert({ ...b, statut: "pending" }).select("*").single();
  if (error) throw error;
  return data as Booking;
}
export async function attachStripeSession(bookingId: string, stripeSessionId: string) {
  const db = createAdminClient();
  const { error } = await db.from("bookings")
    .update({ stripe_session_id: stripeSessionId }).eq("id", bookingId);
  if (error) throw error;
}
// Idempotent : ne confirme qu'une fois (retourne le booking si transition faite, sinon null)
export async function confirmBooking(stripeSessionId: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("bookings")
    .update({ statut: "confirmed" })
    .eq("stripe_session_id", stripeSessionId).eq("statut", "pending")
    .select("*").maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}
export async function cancelBooking(stripeSessionId: string): Promise<Booking | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("bookings")
    .update({ statut: "cancelled" })
    .eq("stripe_session_id", stripeSessionId).eq("statut", "pending")
    .select("*").maybeSingle();
  if (error) throw error;
  return data as Booking | null;
}
```
- [ ] **Step 2 :** `npm run build` → PASS
- [ ] **Step 3 :** Commit `feat: bookings repository`

---

## Task 8 : Client Stripe + route /api/checkout

**Files:** Create `lib/stripe.ts`, `app/api/checkout/route.ts`

- [ ] **Step 1 — client** (`lib/stripe.ts`)
```ts
import "server-only";
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```
- [ ] **Step 2 — route** (`app/api/checkout/route.ts`)
```ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSession } from "@/lib/sessions";
import { reserveSeats, releaseSeats, createPendingBooking, attachStripeSession } from "@/lib/bookings";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { sessionId, nb_places, nom, email } = await req.json();
  const qty = Number(nb_places);
  if (!sessionId || !qty || qty < 1 || !nom || !email)
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const s = await getSession(sessionId);
  if (!s || s.statut !== "publie")
    return NextResponse.json({ error: "Atelier indisponible" }, { status: 404 });

  // 1) Réservation atomique des places
  const ok = await reserveSeats(sessionId, qty);
  if (!ok) return NextResponse.json({ error: "Plus assez de places" }, { status: 409 });

  try {
    const { userId } = await auth();
    const montant = s.prix_cents * qty;
    const booking = await createPendingBooking({
      session_id: sessionId, email, nom, nb_places: qty,
      montant_cents: montant, clerk_user_id: userId ?? null,
    });
    const base = process.env.NEXT_PUBLIC_APP_URL!;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
      customer_email: email,
      line_items: [{
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: s.prix_cents,
          product_data: { name: s.titre },
        },
      }],
      metadata: { booking_id: booking.id, session_id: sessionId, nb_places: String(qty) },
      success_url: `${base}/merci?b=${booking.id}`,
      cancel_url: `${base}/ateliers/${sessionId}`,
    });
    await attachStripeSession(booking.id, checkout.id);
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    await releaseSeats(sessionId, qty); // rollback des places si Stripe échoue
    return NextResponse.json({ error: "Erreur de paiement" }, { status: 500 });
  }
}
```
- [ ] **Step 3 :** `npm run build` → PASS
- [ ] **Step 4 :** Commit `feat: checkout route with atomic reservation`

---

## Task 9 : Emails Resend

**Files:** Create `lib/email.ts`

- [ ] **Step 1** (`lib/email.ts`)
```ts
import "server-only";
import { Resend } from "resend";
import type { Booking, Session } from "./types";
import { formatEUR } from "./money";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM!;

export async function sendConfirmation(b: Booking, s: Session) {
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    dateStyle: "full", timeStyle: "short",
  });
  await resend.emails.send({
    from: FROM, to: b.email,
    subject: `Confirmation — ${s.titre}`,
    html: `<p>Bonjour ${b.nom},</p>
      <p>Votre réservation pour <b>${s.titre}</b> est confirmée.</p>
      <ul><li>${date}</li><li>${s.lieu}</li>
      <li>${b.nb_places} place(s) — ${formatEUR(b.montant_cents)}</li></ul>
      <p>À bientôt !</p>`,
  });
}
export async function notifyOrganizer(b: Booking, s: Session) {
  const to = process.env.ORGANIZER_EMAIL;
  if (!to) return;
  await resend.emails.send({
    from: FROM, to,
    subject: `Nouvelle inscription — ${s.titre}`,
    html: `<p>${b.nom} (${b.email}) — ${b.nb_places} place(s) sur « ${s.titre} ».</p>`,
  });
}
```
- [ ] **Step 2 :** `npm run build` → PASS
- [ ] **Step 3 :** Commit `feat: resend emails`

---

## Task 10 : Webhook Stripe

**Files:** Create `app/api/stripe/webhook/route.ts`

- [ ] **Step 1** (`app/api/stripe/webhook/route.ts`)
```ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { confirmBooking, cancelBooking, releaseSeats } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { sendConfirmation, notifyOrganizer } from "@/lib/email";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text(); // corps BRUT requis pour la vérif de signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as { id: string };
    const booking = await confirmBooking(cs.id); // idempotent
    if (booking) {
      const s = await getSession(booking.session_id);
      if (s) { await sendConfirmation(booking, s); await notifyOrganizer(booking, s); }
    }
  }

  if (event.type === "checkout.session.expired") {
    const cs = event.data.object as { id: string };
    const booking = await cancelBooking(cs.id);
    if (booking) await releaseSeats(booking.session_id, booking.nb_places);
  }

  return NextResponse.json({ received: true });
}
```
- [ ] **Step 2 :** `npm run build` → PASS
- [ ] **Step 3 — brancher le CLI Stripe** (obtient `STRIPE_WEBHOOK_SECRET`)
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copier le `whsec_...` affiché dans `.env.local` → `STRIPE_WEBHOOK_SECRET`.
- [ ] **Step 4 — test E2E** : créer un atelier publié, réserver, payer avec la carte test `4242 4242 4242 4242`, vérifier booking `confirmed`, places incrémentées, email reçu.
- [ ] **Step 5 :** Commit `feat: stripe webhook (confirm/expire)`

---

## Task 11 : Page /merci

**Files:** Create `app/merci/page.tsx`

- [ ] **Step 1**
```tsx
export default function Merci() {
  return (
    <main className="screen py-12 text-center">
      <div className="card">
        <h1 className="text-3xl">Merci !</h1>
        <p className="mt-3 text-muted">
          Votre paiement est confirmé. Un email de confirmation vous a été envoyé.
        </p>
        <a href="/" className="btn-primary mt-6 inline-flex">Retour à l’accueil</a>
      </div>
    </main>
  );
}
```
- [ ] **Step 2 :** Commit `feat: merci page`

---

## Task 12 : Garde admin (allowlist Clerk)

**Files:** Create `lib/admin.ts`, `app/admin/layout.tsx`

- [ ] **Step 1 — garde** (`lib/admin.ts`)
```ts
import "server-only";
import { currentUser } from "@clerk/nextjs/server";

export async function requireAdmin(): Promise<string> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const allow = (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (!email || !allow.includes(email)) throw new Error("FORBIDDEN");
  return email;
}
```
- [ ] **Step 2 — layout** (`app/admin/layout.tsx`)
```tsx
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); }
  catch { redirect("/"); }
  return <div className="screen py-8">{children}</div>;
}
```
(`/admin` est déjà protégé par connexion via `proxy.ts` ; cette garde ajoute le contrôle d'email.)
- [ ] **Step 3 :** `npm run build` → PASS
- [ ] **Step 4 :** Commit `feat: admin allowlist guard`

---

## Task 13 : Admin — liste + création/édition d'ateliers

**Files:** Create `app/admin/page.tsx`, `app/admin/ateliers/actions.ts`, `app/admin/ateliers/nouveau/page.tsx`

- [ ] **Step 1 — Server Actions** (`actions.ts`) : `createSession`, `updateSessionStatus` (insert/update via `createAdminClient`, `revalidatePath`). Convertir le prix saisi en centimes avec `euroToCents`.
- [ ] **Step 2 — liste** (`app/admin/page.tsx`) : tableau des sessions (titre, date, `places_reservees/capacite`, statut) + lien « Voir inscrits » + bouton publier/dépublier.
- [ ] **Step 3 — formulaire** (`nouveau/page.tsx`) : champs titre, description, date_heure (`datetime-local`), durée, lieu, capacité, prix (€) → `createSession`.
- [ ] **Step 4 :** `npm run build` → PASS ; test manuel de création + publication.
- [ ] **Step 5 :** Commit `feat: admin sessions CRUD`

---

## Task 14 : Admin — inscrits + export CSV

**Files:** Create `app/admin/ateliers/[id]/inscrits/page.tsx`, `app/admin/ateliers/[id]/inscrits/export/route.ts`

- [ ] **Step 1 — liste inscrits** : lire `bookings` (statut `confirmed`) d'une session, afficher nom/email/nb_places.
- [ ] **Step 2 — export CSV** (route handler) : générer un CSV (`nom,email,nb_places`) avec en-tête `Content-Disposition: attachment`. Protéger via `requireAdmin()`.
- [ ] **Step 3 :** `npm run build` → PASS
- [ ] **Step 4 :** Commit `feat: admin attendees + CSV export`

---

## Task 15 : Pages légales (gabarits FR)

**Files:** Create `app/(legal)/mentions-legales/page.tsx`, `cgv/page.tsx`, `confidentialite/page.tsx`

- [ ] **Step 1** : 3 pages statiques avec gabarits à compléter (raison sociale, SIRET, responsable, hébergeur Vercel, droit applicable, RGPD/Resend/Stripe/Clerk comme sous-traitants). Marquer clairement les `[À COMPLÉTER]`.
- [ ] **Step 2** : Lien vers ces pages en pied de page (composant `Footer` ajouté au layout).
- [ ] **Step 3 :** Commit `feat: legal pages templates`

---

## Self-review (couverture spec)
- Anti-survente → Task 2 (RPC) + Task 8. ✓
- Paniers abandonnés / expiration → Task 8 (expires_at) + Task 10 (expired). ✓
- Idempotence webhook → Task 7 (`confirmBooking` conditionnel) + contrainte unique. ✓
- Comptes optionnels → `clerk_user_id` capturé en Task 8 (rattachement). Page `/mes-reservations` = **Phase 2**.
- Back-office → Tasks 12–14. ✓
- Emails → Tasks 9–10. ✓
- Légal → Task 15. ✓

## Phase 2 (hors de ce plan)
Page `/mes-reservations` (Clerk), liste d'attente, codes promo, remboursement auto, vérification du domaine email.

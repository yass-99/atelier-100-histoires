# Spec — « Crée ton atelier » (demande de devis groupe)

> Date : 2026-06-10 · Statut : validé en brainstorming
> Levier revenu central du plan marketing (§5 Activation chemin B, §8 Revenu levier 2).

## Objectif

Permettre à un·e organisateur·rice de groupe (EVJF, anniversaire, team building, entre ami·es) de demander un atelier privé via un formulaire ludique. La demande est enregistrée en base, l'organisateur reçoit un accusé immédiat, et l'équipe est notifiée pour répondre un **devis manuel** par email. Aucun prix automatique (volontaire).

## Décisions actées (brainstorming)

1. **Stockage** : table Supabase `devis_requests` + email de notif à l'équipe + email d'accusé au client (option A).
2. **Champs** : prénom, email (requis) ; occasion, nb personnes, type d'atelier, dates souhaitées ; téléphone **optionnel** ; message optionnel.
3. **Points d'entrée** : header + bloc CTA landing + état « aucun atelier programmé » + bloc sur chaque fiche atelier (option C).
4. **Après envoi** : message de succès **inline** (le formulaire se remplace), pas de redirection (option A).

## Architecture

Suit les conventions existantes du repo (miroir de la feature « leads / réduction mystère »).

### 1. Données — `supabase/migrations/2026-06-10_devis_requests.sql`

Table `public.devis_requests` :

| Colonne | Type | Note |
|---|---|---|
| `id` | uuid PK `default gen_random_uuid()` | |
| `created_at` | timestamptz `default now()` | |
| `prenom` | text not null | |
| `email` | text not null | |
| `phone` | text | nullable (optionnel) |
| `occasion` | text not null | enum applicatif (voir shared) |
| `nb_personnes` | int | |
| `type_atelier` | text | « bijoux » par défaut côté form |
| `dates_souhaitees` | text | texte libre |
| `message` | text | nullable |
| `source` | text | UTM / référent — mesure §13 |
| `status` | text not null `default 'nouveau'` | `nouveau` → `repondu`/`confirme`/`perdu` (géré à la main) |
| `handled_at` | timestamptz | nullable |

RLS activée, **aucune policy publique** : l'accès se fait uniquement server-side via le client service-role (`createAdminClient`), cohérent avec la table `leads`. (Vérifier la définition exacte de `leads` à l'implémentation et s'aligner.)

### 2. Logique pure — `lib/devis.shared.ts` (testée en TDD)

- `export type Occasion = "evjf" | "anniversaire" | "team_building" | "entre_amis" | "autre"`.
- `export const OCCASIONS` : liste `{ value: Occasion, label: string }` réutilisée par le form (boutons) et la validation.
- `parseDevisInput(raw: unknown): { ok: true; value: DevisInput } | { ok: false; error: string }` :
  - email validé (même regex que `app/api/leads/route.ts`), normalisé via `normalizeEmail` (réutilisé de `leads.shared`).
  - `prenom` requis (non vide après trim).
  - `occasion` doit appartenir à l'enum.
  - `nb_personnes` : entier optionnel ≥ 1 si fourni.
  - `type_atelier`, `dates_souhaitees`, `phone`, `message`, `source` : strings optionnelles trimmées.
- `DevisInput` = forme normalisée prête à insérer.

### 3. Lib serveur — `lib/devis.ts` (`server-only`)

- `createDevisRequest(input: DevisInput): Promise<{ id: string }>` — insert via `createAdminClient()`, renvoie l'id.

### 4. Emails — `lib/email.ts` + `lib/email-template.ts`

- `sendDevisAck(email: string, prenom: string)` — accusé client, sujet type « Bien reçu ! On prépare ta proposition ✦ ». Template `devisAckEmailHtml(prenom)` via `shell()` + `ctaButton()` existants (CTA vers `NEXT_PUBLIC_APP_URL`).
- `notifyDevisRequest(d: DevisInput & { id: string })` — notif à `process.env.ORGANIZER_EMAIL` (early-return si absent, comme `notifyOrganizer`) avec tout le détail de la demande pour répondre vite.

### 5. API — `app/api/devis/route.ts`

`POST` :
1. `await req.json().catch(() => ({}))`.
2. `parseDevisInput` → si `!ok`, `NextResponse.json({ error }, { status: 400 })`.
3. `createDevisRequest`.
4. Les **deux emails en non-bloquant** (try/catch loggé, comme `sendLeadWelcome`) — une demande est toujours persistée même si Resend échoue.
5. `NextResponse.json({ ok: true })`.

`source` lu depuis le body (UTM transmis par le form) ; à défaut, `req.headers.get("referer")`.

### 6. Page + formulaire

- `app/cree-ton-atelier/page.tsx` (server component, statique) : hero (« Réunis ta bande autour d'une création ») + bénéfices (EVJF / anniv / team building / entre ami·es) + `<DevisForm/>`. Pas d'emoji dans l'UI (règle repo).
- `app/cree-ton-atelier/devis-form.tsx` (`"use client"`, style calqué sur `reserve-form.tsx`) :
  - Champs : prénom, email, occasion (groupe de boutons depuis `OCCASIONS`), nb personnes (sélecteur ± réutilisant le pattern places), type d'atelier (select, « Bijoux » par défaut + « Autre / à discuter »), dates (input texte libre), téléphone (optionnel), message (textarea optionnel).
  - Note RGPD discrète : lien vers `/confidentialite`, **pas de checkbox** (recontact au sujet de la demande = intérêt légitime, pas du marketing).
  - Submit → `track("devis_demande", { occasion, nb_personnes })` → fetch `/api/devis` → **succès inline** (le form est remplacé par l'état « C'est envoyé ✦ — on revient vers toi sous 24 h »).
  - Erreurs : message FR (validation serveur) + bouton réactif (pattern pop-up / reserve-form).

### 7. Points d'entrée (option C)

- **Header** (`components/Header.tsx`) : lien « Crée ton atelier » → `/cree-ton-atelier` (à côté de Connexion). Note : le header est masqué sur `/ateliers/*`, d'où le point d'entrée dédié sur la fiche ci-dessous.
- **Landing** (`app/page.tsx`) : nouveau composant `components/CreeTonAtelierCta.tsx` inséré après `Promesse`.
- **Empty-state** : dans `app/page.tsx`, quand `sessions.length === 0`, afficher le CTA « crée ton atelier » au lieu du seul message « aucun atelier programmé ».
- **Fiche atelier** (`app/ateliers/[id]/page.tsx`) : bloc « Tu préfères en privé avec ta bande ? » → `/cree-ton-atelier`.

## Flux de données

Visiteur → form → `POST /api/devis` → insert `devis_requests` + (accusé client ∥ notif équipe) → réponse manuelle du devis par email. Aucune logique de prix automatique.

## Gestion d'erreurs

- Validation : message FR clair, statut 400.
- Emails non-bloquants : la demande est **toujours enregistrée** même si Resend refuse (domaine non vérifié, etc.).
- Réseau : message + bouton réactif côté client.

## Mesure

- Event Vercel `devis_demande` (occasion, nb_personnes).
- Colonne `source` pour attribuer les groupes par canal (§13).
- Lecture directe de `devis_requests` dans Supabase (pas de back-office dédié pour l'instant).

## Tests & vérification

- **TDD vitest** sur `lib/devis.shared.ts` : valide / email manquant / email invalide / occasion hors enum / nb_personnes invalide / optionnels absents.
- Vérif finale : `tsc --noEmit`, `vitest`, `eslint` (standard repo, 0 erreur attendu).
- Route / emails / page : vérif manuelle (envoi réel dépend de la vérif domaine Resend — limite connue déjà documentée).
- **Pré-implémentation obligatoire** : lire les guides Next locaux pertinents (`node_modules/next/dist/docs/`) avant d'écrire route + page (consigne AGENTS.md : « This is NOT the Next.js you know »).

## Hors scope (YAGNI)

- Back-office d'administration des devis (géré par email + table Supabase lisible).
- Prix automatique / calcul de devis.
- Cross-sell remise mystère sur la confirmation (option C écartée).
- Page `/merci` dédiée (succès inline).

## Variables d'environnement

Aucune nouvelle : réutilise `ORGANIZER_EMAIL`, `RESEND_FROM`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL` (tous déjà utilisés).

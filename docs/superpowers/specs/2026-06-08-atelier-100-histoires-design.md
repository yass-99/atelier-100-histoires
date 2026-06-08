# Atelier des 100 histoires — Spec de conception

**Date :** 2026-06-08
**Statut :** Validé (brainstorming), prêt pour le plan d'implémentation

## 1. Objectif

Site sur-mesure permettant de **vendre des places sur des ateliers de groupe planifiés**, avec
**paiement en ligne** (EUR, France). Un mini back-office permet à l'organisateur de créer les
ateliers et de voir les inscrits. Déploiement sur Vercel.

## 2. Stack

| Brique | Choix | Rôle |
|--------|-------|------|
| Frontend + API | **Next.js (App Router)** sur **Vercel** | Pages publiques, back-office, endpoints API (route handlers TypeScript) |
| Authentification | **Clerk** | Comptes participants (optionnels) + protection du back-office admin |
| Base de données | **Supabase (Postgres)** — données uniquement | Stockage sessions & inscriptions |
| Paiement | **Stripe Checkout** (page hébergée) | Encaissement, zéro PCI à gérer |
| Emails | **Resend** | Emails transactionnels (confirmation, notification organisateur) |

**Décisions écartées :**
- *Supabase Auth* → remplacé par **Clerk**.
- *FastAPI* → inutile ici ; les route handlers Next.js suffisent (un seul langage, un seul déploiement, pas de CORS).
- *Remboursement automatique* → hors périmètre v1.

## 3. Modèle de données (Supabase Postgres)

### Table `sessions` (un atelier planifié)
- `id` (uuid, PK)
- `titre` (text)
- `description` (text)
- `date_heure` (timestamptz)
- `duree` (int, minutes)
- `lieu` (text)
- `capacite` (int)
- `prix_cents` (int)
- `statut` (enum : `brouillon` | `publie` | `annule`)
- `places_reservees` (int, défaut 0) — compteur atomique
- `created_at` (timestamptz)

### Table `bookings` (une inscription)
- `id` (uuid, PK)
- `session_id` (uuid, FK → sessions)
- `clerk_user_id` (text, nullable — vide si invité)
- `email` (text)
- `nom` (text)
- `nb_places` (int)
- `montant_cents` (int)
- `statut` (enum : `pending` | `confirmed` | `cancelled`)
- `stripe_session_id` (text, unique — idempotence)
- `created_at` (timestamptz)

### Sécurité
- Toutes les lectures/écritures de `bookings` passent par le serveur Next.js avec la
  **clé secrète Supabase** (`sb_secret_...`, variable `SUPABASE_SECRET_KEY`). Jamais d'accès
  `bookings` côté client.
- Les `sessions` au statut `publie` sont lues **côté serveur** (Server Components) avec la même
  clé. Pas de lecture client en v1.
- Le **webhook Stripe est la seule source** qui fait passer un booking en `confirmed`.

### Setup client Supabase (décidé — important)
- On installe **uniquement `@supabase/supabase-js`** (PAS `@supabase/ssr`).
- **Un seul client serveur** (`createClient` + `SUPABASE_SECRET_KEY`, `persistSession: false`,
  `autoRefreshToken: false`) dans `lib/supabase/server.ts`, importé **uniquement** dans du code
  serveur (Server Components, Route Handlers, Server Actions).
- **Pas** de middleware de refresh de session Supabase, **pas** de client navigateur, **pas** de
  clé publishable côté client : l'auth est gérée par **Clerk**, donc on évite de faire cohabiter
  deux systèmes de sessions à cookies. (Le Quickstart par défaut du dashboard Supabase, basé sur
  Supabase Auth, n'est volontairement PAS suivi.)
- La clé secrète bypass RLS : ne jamais l'exposer au client, ne jamais la log, ne jamais la
  renvoyer dans une réponse API.

## 4. Authentification (Clerk)

- **Participants** : réservation possible **en invité** OU **connecté via Clerk**. Si connecté,
  l'inscription est rattachée au compte (`clerk_user_id`) → l'utilisateur retrouve ses réservations.
- **Admin** : le back-office `/admin` est protégé par Clerk et n'autorise qu'une **liste d'emails
  autorisés** (variable d'environnement `ADMIN_EMAILS`). Pas de mot de passe en dur.

## 5. Flux de réservation & paiement

```
1. Page atelier → affiche places restantes (capacite - places_reservees)
2. Clic « Réserver » → choisit nb de places + nom/email (pré-rempli si Clerk connecté)
3. POST /api/checkout :
      a. Réserve les places de façon ATOMIQUE (RPC Postgres, voir ci-dessous)
      b. Crée un booking "pending"
      c. Crée une session Stripe Checkout (expiration 30 min) → renvoie l'URL
4. Redirection vers Stripe Checkout (page hébergée Stripe)
5. Paiement OK → redirection vers /merci
6. EN PARALLÈLE : Stripe → POST /api/stripe/webhook
      → booking "confirmed"
      → email Resend (participant + notification organisateur)
```

### Anti-survente (point critique) — RPC atomique Postgres
```sql
UPDATE sessions
SET places_reservees = places_reservees + :nb
WHERE id = :session_id
  AND places_reservees + :nb <= capacite   -- garde-fou
RETURNING id;
```
Si aucune ligne ne revient → plus assez de places → on bloque AVANT de créer la session Stripe.
Atomique : deux requêtes simultanées ne peuvent pas dépasser la capacité.

### Libération des places (paniers abandonnés)
- Session Stripe Checkout **expire après 30 min**. Le webhook `checkout.session.expired`
  relibère les places (`places_reservees - nb`, booking → `cancelled`).
- Filet de sécurité : nettoyage des `pending` de plus d'1h.

### Cas d'échec gérés
- Paiement refusé → places relibérées.
- Webhook reçu en double → idempotence via `stripe_session_id` (contrainte unique).
- Atelier annulé par l'admin → inscrits notifiés par email (pas de remboursement auto en v1).

### Remboursements
- **Aucun en v1.** Si besoin, l'organisateur rembourse manuellement depuis le dashboard Stripe.

## 6. Back-office `/admin` (protégé Clerk)

- **Liste des ateliers** : statut, places vendues / restantes.
- **Créer / éditer un atelier** : titre, description, date/heure, durée, lieu, capacité, prix, statut.
- **Voir les inscrits** d'un atelier : nom, email, nb de places, statut paiement + **export CSV**.

## 7. Emails (Resend)

1. **Confirmation au participant** (après paiement) : récap atelier, date, lieu, nb de places.
2. **Notification à l'organisateur** : « Nouvelle inscription sur [atelier] ».

## 8. Pages publiques

- **Accueil** : présentation + liste des prochains ateliers publiés.
- **Page atelier** : détail + bouton réserver + places restantes.
- **/merci** : confirmation après paiement.
- **/mes-reservations** : visible si connecté via Clerk (phase 2).
- **Pages légales** (France, obligatoires) : Mentions légales, CGV, Politique de confidentialité
  (RGPD), cookies — fournies sous forme de **gabarits à compléter** (raison sociale, SIRET, etc.).

## 9. Découpage en phases

- **Phase 1 (MVP)** : pages publiques + réservation **invité** + Stripe + webhook + emails +
  back-office + pages légales. *(Cœur livrable rapidement.)*
- **Phase 2** : comptes Clerk participants + page `/mes-reservations`.

## 10. Hors périmètre v1 (YAGNI)

Listes d'attente, codes promo, abonnements, remboursement automatique, multi-organisateurs,
avis/notes, calendrier récurrent automatique.

## 11. Variables d'environnement (référence)

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADMIN_EMAILS=               # emails autorisés pour /admin (séparés par virgule)

# Supabase (données uniquement, pas d'auth Supabase)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=        # clé sb_secret_... — serveur uniquement, bypass RLS, jamais exposée

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
ORGANIZER_EMAIL=            # destinataire des notifications d'inscription

# App
NEXT_PUBLIC_APP_URL=
```

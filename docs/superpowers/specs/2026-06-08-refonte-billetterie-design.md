# Refonte billetterie — Design (MVP « niveau pro »)

> Date : 2026-06-08 · Slug : `refonte-billetterie`
> Objectif : porter l'app « Atelier des 100 histoires » au niveau de finition des
> inspirations fournies (kit billetterie périwinkle = Image #3, app learning =
> Image #4), tout en restant **mobile-first**, **intuitive** et **honnête** sur
> les données réellement disponibles.

## 1. Objectif & périmètre

Refondre le parcours public de bout en bout :

1. **Accueil** — sélecteur de **jours** scrollable horizontalement (filtre) + liste
   de cartes colorées.
2. **Détail atelier** — vitrine immersive (hero en moitié haute colorée, mini-stats,
   « À propos » + « Lire plus », CTA collant).
3. **Achat** — écran dédié `/ateliers/[id]/reserver` (Prénom, Nom, Email, nombre de
   places) → Stripe.
4. **Confirmation = E-Ticket** — carte ticket à **encoches demi-cercle + perforation
   pointillée + QR**, suivie d'une **incitation à créer un compte**.
5. **Connexion / Inscription** — pages **UI custom (hooks Clerk)**, **sans étape de
   vérification**, email pré-rempli depuis le checkout.

### Non-objectifs (hors périmètre, plus tard)

- **Catégories** (filtres « Music / Sport… ») — explicitement repoussées.
- Espace « Mes billets » persistant / back-office organisateur.
- Paiement multi-devises, codes promo, liste d'attente.

## 2. Langage visuel (à reproduire fidèlement)

Réutiliser le design system existant (`app/globals.css`, tokens `@theme`) et y
ajouter deux motifs tirés de l'Image #4 :

- **Moitié de page colorée** : bande haute en dégradé/ton bord-à-bord de la colonne
  mobile, puis contenu sur une **feuille blanche arrondie** (`rounded-t-[2rem]`) qui
  remonte par-dessus (`-mt-…`).
- **Boutons ronds à flèche centrée** (`.arrow-fab` existant) comme signature
  d'action/navigation.

Garde-fous intuitivité (anticipe l'audit) :
- **Bandes hautes calmes** (un seul ton doux, ex. `tone-lavender`) pour laisser
  ressortir les cartes multicolores.
- **Boutons en pilule** conservés (`rounded-full`, identité actuelle) ; on aligne
  seulement **taille/placement** sur l'inspi (CTA collant pleine largeur ~56px).
- Cibles tactiles ≥ 44px, contrastes AA, focus visibles (déjà la base du système).

## 3. Modèle de données

| Changement | Détail |
|---|---|
| `sessions.image_url` | **Nouvelle colonne `text` nullable**. Migration Supabase. Si présente → hero photo ; sinon → fallback dégradé+blobs. |
| `bookings` | **Aucun changement de schéma**. Le form collecte Prénom + Nom mais envoie `nom = "Prénom Nom"` (contrat `/api/checkout` inchangé). |

Migration :
```sql
alter table sessions add column if not exists image_url text;
```

## 4. Spécification par écran

### 4.1 Accueil (`app/page.tsx`)

- **Bande haute colorée** (`tone-lavender`/`brand-soft`, bord-à-bord) : salutation +
  gros titre `font-display` + **`DayStrip`**.
- **`DayStrip`** (client) : `overflow-x-auto`, pastilles `.day-pill`
  `[Tous] [lun 9] [sam 14] …` ; n'affiche **que les dates ayant ≥ 1 atelier publié** ;
  la sélectionnée en ton `ink` ; tap → filtre la liste.
- **Feuille blanche arrondie** qui remonte, contenant **`SessionList`** (client) :
  cartes filtrées par jour. Quand « Tous », la 1ʳᵉ carte est en format **featured**
  (plus grande) pour le rythme ; sinon cartes uniformes.
- **`AtelierCard`** : vignette (`image_url` ou dégradé `toneForIndex`), **pastille date
  ronde**, lieu en `eyebrow`, titre, ligne « X places • prix », **`arrow-fab`** « y aller ».
- **« Comment ça marche »** conservé en bas (statique, hors filtre — utile crédibilité/Nielsen).
- État vide conservé (aucun atelier).

Architecture : `page.tsx` (serveur) récupère les sessions et passe le tableau à un
composant client `<SessionsBoard sessions={…} />` qui gère état du jour sélectionné +
rendu `DayStrip` + `SessionList`. Le filtrage est **client-side** (données déjà chargées).

### 4.2 Détail atelier (`app/ateliers/[id]/page.tsx`)

- **Moitié haute = hero** bord-à-bord : photo `image_url` ou `tone-brand`+`Floaty` blobs.
  En overlay : **bouton rond retour** (`.circle-btn`, haut-gauche) + **bouton rond
  partage** (haut-droit).
- Sur la feuille blanche qui chevauche le hero :
  - Titre + **pastille date ronde** ; ligne horaire (icône horloge) + durée (`formatDuree`).
  - **Rangée de 3 `StatChip`** : Places restantes · Durée · Lieu. *(On remplace
    Rating/Members de l'inspi qu'on n'a pas — honnêteté.)*
  - **« À propos »** + **`AboutCollapse`** (« Lire plus » si description longue).
- **CTA collant bas** (`position: sticky`/barre fixe), pleine largeur ~56px :
  `Réserver — {prix} / place` + `arrow-fab` à droite → `/ateliers/[id]/reserver`.
  Si **complet** → bouton désactivé « Complet » + lien « Voir les autres ateliers ».

### 4.3 Achat (`app/ateliers/[id]/reserver/page.tsx` — NOUVEAU)

- Page **serveur** : `getSession(id)`, `notFound()` si absent/non publié/complet ;
  re-vérifie `placesRestantes`.
- Bandeau récap atelier (vignette + titre + date) en tête.
- **`ReserveForm`** (client, repris de l'actuel, restylé) :
  - Champs : **Prénom**, **Nom** (séparés), **Email** (obligatoire), **stepper
    Nombre de places** (−/+, borné à `max`).
  - Récap prix dynamique. Erreurs inline (`role="alert"`).
  - Concatène `nom = \`${prenom} ${nom}\`` puis `POST /api/checkout` → redirige vers
    `data.url` (Stripe). Contrat API inchangé.
  - CTA collant `Payer {total} 🔒`.
- Le **détail** ne contient plus le form inline (déplacé ici).

### 4.4 Confirmation = E-Ticket (`app/merci/page.tsx`)

- Devient **server component** lisant `searchParams.b` (booking id, déjà passé par
  `success_url`). Ajout `getBooking(id)` dans `lib/bookings.ts`.
- Si `b` absent/introuvable → **fallback** vers l'écran de confirmation générique
  actuel (dégradé gracieux).
- Sinon récupère booking + session et rend **`Ticket`** :
  - **Fond de page coloré**.
  - Carte ticket périwinkle : hero (`image_url`/dégradé), `eyebrow`
    « Atelier des 100 histoires », titre.
  - Grille 2 colonnes : **Date / Heure**, **Réf. réservation** (`booking.id` court,
    majuscules) **/ Places** (`nb_places`), **Lieu** pleine largeur. Petite ligne
    « Au nom de : {nom} ».
  - **Perforation** `.ticket-perf` : ligne pointillée + **deux encoches demi-cercle**
    (gauche/droite) via pseudo-éléments couleur `--color-background`.
  - **QR** encodant `booking.id` (réf, scannable check-in) — généré **côté serveur**
    via lib `qrcode` (data URL/SVG, zéro appel externe).
- **`arrow-fab`** « Découvrir d'autres ateliers » → `/`.
- **`SignInIncentive`** (client) sous le ticket :
  - `auth()` serveur → si **non connecté** : carte forte « Crée ton compte pour
    **retrouver tes billets** et **être informé** des prochains ateliers » → lien
    `/sign-up?email={booking.email}` (email pré-rempli).
  - Si **connecté** : message « Tu retrouveras ce billet dans ton espace ».

### 4.5 Connexion / Inscription (UI custom Clerk)

- `app/sign-in/[[...sign-in]]/page.tsx` & `app/sign-up/[[...sign-up]]/page.tsx` :
  remplacer `<SignIn/>`/`<SignUp/>` prébuilts par des **formulaires custom**
  (`useSignIn` / `useSignUp`) suivant le skill `clerk-custom-ui`.
- **Sans vérification** : l'inscription se termine sans code email.
  - **Prérequis instance Clerk** : « require email verification » désactivé (à régler
    via skill `clerk-cli` ou dashboard — étape de build, rappelée à l'utilisateur).
  - Flux : `signUp.create({ emailAddress, password })` → si statut `complete` →
    `setActive` → redirige. (Gérer le cas où l'instance impose encore la vérif :
    message clair.)
- **Email pré-rempli** : lire `?email=` (depuis l'incitation post-achat).
- **Style** : moitié haute colorée + boutons ronds, libellés FR (« Connexion »,
  « Créer mon compte »). Soigner **tous les états** : chargement, erreurs de champ,
  identifiants invalides, accessibilité (labels, focus, `aria-live`) — surface
  scrutée par l'audit.
- **Routes** inchangées (`/sign-in`, `/sign-up`, déjà câblées) ; alias FR possibles
  plus tard.

## 5. Composants & fichiers

**Nouveaux composants** (`components/`) :
`SessionsBoard` (client, état jour), `DayStrip`, `AtelierCard`, `StatChip`,
`AboutCollapse`, `Ticket`, `SignInIncentive`, `CircleButton`, `SignInForm`,
`SignUpForm`.

**Nouveaux fichiers** :
`app/ateliers/[id]/reserver/page.tsx`, migration SQL `image_url`.

**Modifiés** :
`app/page.tsx`, `app/ateliers/[id]/page.tsx`, `app/ateliers/[id]/reserve-form.tsx`
(déplacé/restylé), `app/merci/page.tsx`, pages sign-in/sign-up, `lib/bookings.ts`
(+`getBooking`), `lib/types.ts` (+`image_url`), `app/globals.css` (+classes),
`package.json` (+`qrcode`).

**Nouvelles classes CSS** (`@layer components`) :
`.day-pill`, `.ticket`, `.ticket-perf`, `.stat-chip`, `.hero-band`, `.sheet`,
`.circle-btn`.

## 6. Technique de la perforation (signature visuelle)

Carte ticket en deux blocs (haut = infos, bas = QR) séparés par une zone de perforation :
- **Encoches** : pseudo-éléments `::before`/`::after` ronds (`rounded-full`), couleur
  `--color-background`, positionnés `left: -r` / `right: -r` à la hauteur de la
  perforation, pour « creuser » les bords.
- **Pointillés** : `border-top: 2px dashed` (couleur sur fond ticket) entre les deux
  encoches.
- Conteneur ticket `overflow: visible` pour laisser dépasser les encoches.

## 7. Phase finale — Audit UX

Après construction, lancer (avec accord pour l'install) les skills
`mastepanoski/claude-skills` :
`ux-audit-rethink`, `nielsen-heuristics-audit`, `wcag-accessibility-audit`,
`don-norman-principles-audit`, `ui-design-review` sur les écrans livrés, puis
**corriger par ordre de sévérité**. Skills à installer via `npx skills add` (non
présents aujourd'hui — étape explicite).

## 8. Points à vérifier au plan (cette version de Next diffère — AGENTS.md)

- Câblage **Clerk côté serveur** sans `middleware.ts` source (`auth()` est utilisé
  dans `/api/checkout`) : confirmer la convention de cette version de Next avant de
  toucher l'auth. Lire `node_modules/next/dist/docs/`.
- Confirmer le réglage Clerk « no email verification » (CLI vs dashboard).
- Position `sticky` du CTA dans la colonne `max-w-md` centrée (barre fixe vs sticky).

## 9. Risques & arbitrages

- **Sécurité ticket** : `/merci?b=<uuid>` est devinable seulement par UUID → acceptable
  MVP (à noter, pas de données sensibles au-delà du nom).
- **Sécurité auth** : sans vérification email, emails non prouvés → arbitrage
  conversion assumé pour le MVP.
- **UI custom Clerk** : plus de surface d'erreur à couvrir que les prébuilts ;
  mitigé par soin des états + audit final.
- **Densité couleur** : risque de surcharge visuelle → bandes hautes en ton unique.
```

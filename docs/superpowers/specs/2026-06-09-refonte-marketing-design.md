# Refonte marketing : positionnement réel, public/conso, pop-up réduction mystère, preuve sociale

**Date** : 2026-06-09
**Statut** : validé par l'utilisateur (design approuvé en brainstorming)

## Contexte

Le site présente aujourd'hui « l'Atelier des 100 histoires » comme des ateliers
d'écriture et de récit. C'est faux. L'activité réelle : des **ateliers créatifs
manuels** — création de bijoux (adultes et mixte grands/petits, avec choix des
huiles, matériaux, parfums), peinture inspirée de Van Gogh pour enfants
(plusieurs matières, l'enfant repart avec son tableau), mosaïque, plateaux de
présentation, textile — organisés dans des **lieux variés et chaleureux**
(boulangeries, restaurants…). Certains ateliers **incluent la consommation sur
place** dans le prix. Chaque participant **repart avec sa création**.

Objectifs :

1. Refléter cette réalité dans le modèle de données et l'admin (public visé,
   consommation incluse).
2. Réécrire tous les textes marketing autour de l'angle **« Crée de tes mains,
   repars avec ta création »**.
3. Améliorer le taux de conversion : pop-up « réduction mystère » avec capture
   d'email + consentement RGPD, remise appliquée automatiquement au checkout.
4. Preuve sociale : témoignages réels gérés depuis l'admin + signaux factuels
   calculés depuis la base. **Aucun faux avis** (pratique commerciale
   trompeuse, illégale — directive Omnibus / DGCCRF).

## Chantier 1 — Modèle de données et admin : public visé & consommation

### Migration `supabase/migrations/2026-06-09_session_public_conso.sql`

Colonnes ajoutées à `sessions` :

| Colonne | Type | Contrainte | Défaut |
|---|---|---|---|
| `public_cible` | `text` | `check in ('adultes','enfants','tous')`, `not null` | `'tous'` |
| `age_minimum` | `int` | nullable (pertinent si enfants/tous) | `null` |
| `conso_incluse` | `boolean` | `not null` | `false` |
| `conso_detail` | `text` | nullable | `null` |

### Types (`lib/types.ts`)

- `export type PublicCible = "adultes" | "enfants" | "tous";`
- `Session` gagne `public_cible: PublicCible`, `age_minimum: number | null`,
  `conso_incluse: boolean`, `conso_detail: string | null`.

### Admin (`app/admin/AtelierForm.tsx` + `app/admin/actions.ts`)

- Menu déroulant « Public » (Tous publics / Adultes / Enfants).
- Champ « Âge minimum » (nombre, optionnel), affiché uniquement si le public
  sélectionné est `enfants` ou `tous`.
- Case « Consommation sur place incluse dans le prix » + champ texte
  « Détail conso » (ex. « boisson chaude + pâtisserie incluses »), affiché si
  la case est cochée.
- `createSession` (et la mise à jour si elle existe) transmettent ces champs.

### Affichage visiteur

- **Badges** sur `AtelierCard` et le hero « à la une » : « Tous publics » /
  « Adultes » / « Enfants » avec « · dès X ans » si `age_minimum` renseigné ;
  badge « Conso incluse » si `conso_incluse`.
- **Page atelier** (`app/ateliers/[id]/page.tsx`) : bloc d'infos pratiques
  reprenant public visé (avec âge minimum) et consommation (avec
  `conso_detail` si présent).

## Chantier 2 — Réécriture des textes marketing

Angle principal : **« Crée de tes mains, repars avec ta création »** — dans des
lieux chaleureux, pour petits et grands. Le nom « 100 histoires » est justifié :
*chaque création raconte la tienne*.

Fichiers réécrits (texte uniquement, pas de refonte structurelle) :

- `app/page.tsx` : eyebrow et hero (« Ateliers créatifs pour petits & grands »,
  sous-titre orienté création + lieux), état vide.
- `components/Promesse.tsx` : 3 points — tu repars avec ta création ; des
  ateliers pour petits et grands ; des lieux conviviaux et gourmands
  (consommation incluse sur certains ateliers).
- `components/Faq.tsx` : questions réalistes — faut-il être créatif/doué ?
  le matériel est-il fourni ? à partir de quel âge pour les enfants ?
  la consommation est-elle comprise ? où ont lieu les ateliers ?
- `components/RestePrevenu.tsx` : accroche alignée au positionnement.
- `app/layout.tsx` : `metadata.title` / `metadata.description`.
- `app/sign-in/.../page.tsx`, `app/sign-up/.../page.tsx`,
  `components/auth/SignInForm.tsx`, `components/auth/SignUpForm.tsx` :
  accroches alignées (mentions d'écriture supprimées).
- Vérification globale : `grep` sur « écriture », « récit », « texte »,
  « histoire » pour traquer les restes de l'ancien positionnement.

## Chantier 3 — Pop-up « réduction mystère »

### Comportement

- Composant client `components/MysteryPopup.tsx`, monté sur les pages
  publiques (layout), **jamais** sur `/admin`, `/merci`, ni pendant un
  checkout.
- Déclenchement : ~8 s après l'arrivée **ou** 30 % de scroll, le premier des
  deux. Une seule fois par visiteur : `localStorage` (clé du type
  `mystery_popup_v1` = `dismissed` ou `claimed`).
- Formulaire : email + **case à cocher obligatoire** de consentement
  marketing, libellé explicite avec lien vers `/confidentialite`. Sans
  consentement coché, l'envoi est bloqué (RGPD).
- Après envoi : révélation immédiate de la remise tirée, avec animation
  « cadeau », et mention « remise appliquée automatiquement quand tu réserves
  avec cet email ».
- Email déjà inscrit : on ré-affiche la remise déjà tirée (pas de re-tirage).

### Tirage

Côté serveur (route `app/api/leads/route.ts` ou server action) :
−5 % (50 %), −10 % (40 %), −15 % (10 %).

### Stockage — migration `supabase/migrations/2026-06-09_leads_reduction.sql`

Table `leads` :

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | `uuid` | pk, `gen_random_uuid()` |
| `email` | `text` | `not null`, `unique` (normalisé en minuscules) |
| `consent` | `boolean` | `not null` |
| `consented_at` | `timestamptz` | `not null default now()` |
| `discount_pct` | `int` | `not null` (5, 10 ou 15) |
| `used_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | `default now()` |

Cette table servira aussi de base d'emailing marketing ultérieure.

## Chantier 4 — Application automatique de la remise au checkout

- 3 coupons Stripe `mystere_5`, `mystere_10`, `mystere_15` (`percent_off`,
  `duration: "once"`), créés **paresseusement** par le code : au premier
  usage, si `resource_missing`, le coupon est créé avec son id fixe
  (helper dans `lib/stripe.ts`).
- `app/api/checkout/route.ts` : lookup `leads` par email (minuscules). Si
  trouvé, `consent` vrai et `used_at` nul → ajout de
  `discounts: [{ coupon: "mystere_<pct>" }]` à la création de la session
  Stripe Checkout. (`allow_promotion_codes` et `discounts` sont exclusifs —
  on n'active pas l'autre champ.)
- **Usage unique** : le webhook (`app/api/stripe/webhook/route.ts`) pose
  `used_at` quand le paiement est confirmé. Un panier abandonné ne consomme
  pas la remise. L'id du lead (ou l'email) transite par `metadata` du
  checkout pour fiabiliser le marquage.
- `app/ateliers/[id]/reserve-form.tsx` : à la saisie de l'email (au blur ou
  debounce), appel léger qui répond seulement « remise disponible : oui/non
  (+pct) » ; si oui, affiche « 🎁 Ta remise mystère de −X % sera appliquée au
  paiement ». L'endpoint ne révèle jamais d'autres données du lead.

## Chantier 5 — Preuve sociale (sans faux avis)

### Témoignages — migration `2026-06-09_temoignages.sql`

Table `temoignages` :

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | `uuid` | pk |
| `prenom` | `text` | `not null` |
| `note` | `int` | `not null`, `check (note between 1 and 5)` |
| `texte` | `text` | `not null` |
| `contexte` | `text` | nullable (ex. « Atelier bijoux — mars 2026 ») |
| `photo_url` | `text` | nullable (photo de la création) |
| `publie` | `boolean` | `not null default false` |
| `created_at` | `timestamptz` | `default now()` |

- **Admin** : section « Témoignages » dans `/admin` — ajout (prénom, note,
  texte, contexte, photo), liste, publier/dépublier, supprimer. L'admin y met
  de **vrais retours de participants** ; le site n'invente rien.
- **Accueil** : section « Ils ont créé chez nous » (étoiles, texte, prénom,
  contexte, photo éventuelle), affichée seulement s'il existe au moins un
  témoignage publié.

### Signaux factuels (calculés, donc toujours vrais)

- **Cartes ateliers** : « Plus que X places » quand il reste ≤ 3 places
  (calcul `capacite - places_reservees`, donnée déjà disponible).
- **Bandeau de chiffres** sur l'accueil : « X créations reparties avec leur
  créateur » (somme des `nb_places` des réservations confirmées) et « X lieux
  partenaires » (nombre de `lieu` distincts des sessions publiées). Chaque
  chiffre n'est affiché qu'au-delà d'un seuil de crédibilité (ex. ≥ 10
  créations, ≥ 2 lieux) pour ne pas faire vide au lancement.

## Hors périmètre (explicitement)

- Envoi d'emails (le code promo est révélé à l'écran, pas envoyé) — la base
  `leads` prépare l'emailing futur.
- Collecte automatique d'avis post-atelier (proposé pour plus tard).
- Filtres de recherche par public sur la liste des ateliers.
- Faux témoignages ou compteurs gonflés : refusé, illégal.

## Gestion d'erreurs

- Pop-up : erreur réseau → message d'erreur dans la pop-up, possibilité de
  réessayer ; jamais de blocage de navigation.
- Checkout : si le lookup `leads` ou la création du coupon échoue, le
  checkout **continue sans remise** (la réservation prime sur la promo).
- Webhook : le marquage `used_at` est idempotent.

## Tests

- Tirage : distribution bornée aux valeurs {5, 10, 15} ; normalisation email.
- Checkout : remise appliquée si lead valide ; pas de remise si `used_at`
  posé, si consentement absent ou si email inconnu ; checkout fonctionnel si
  Stripe refuse le coupon.
- Badges : rendu selon `public_cible` / `age_minimum` / `conso_incluse`.
- Webhook : pose `used_at` une seule fois.

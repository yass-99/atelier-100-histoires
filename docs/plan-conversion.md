# Plan conversion — Atelier aux 100 histoires

> Issu de l'audit du 2026-06-10 (CRO · UX/animations · SEO · marketing).
> Positionnement : **ateliers DIY tous âges**, dans des **cafés / boulangeries / commerces locaux**, on **repart avec sa création**, **conso parfois incluse** dans le tarif.

## Objectif de conversion

Prérequis : **mesurer** le funnel (fait en P0). Cibles réalistes (trafic local qualifié) :

| Étape | Aujourd'hui | Objectif |
|---|---|---|
| Visite → clic fiche atelier | inconnu | 40 % |
| Fiche → page réservation | inconnu | 35 % |
| Réservation → paiement réussi | inconnu | 60 % |
| **Global visite → achat** | inconnu | **4–5 %** |

---

## P0 — ✅ FAIT (2026-06-10)

Quick wins quasi gratuits, fondations de tout le reste.

- [x] **Instrumenter le funnel** — 7 événements Vercel Analytics
  - `atelier_clic` (hero + cartes), `discount_detected`, `checkout_started`, `checkout_error`, `purchase_completed` (dédupliqué localStorage sur `/merci`)
  - Fichiers : `HeroAlaUne.tsx`, `AtelierCard.tsx`, `reserve-form.tsx`, `components/TrackPurchase.tsx`, `app/merci/page.tsx`
- [x] **Hero value prop** — H1 = promesse « Crée de tes mains, repars avec ta création » (« À la une » → eyebrow), sous-titre recadré (cafés & boulangeries, matériel + gourmandise compris), **prix « dès X € » visible** — `app/page.tsx`
- [x] **CTA cohérents** — « Je suis intéressé » → **« Je réserve »** ; complet → « Voir l'atelier » — `AtelierCard.tsx`
- [x] **Garantie au paiement** — ligne « Annulation gratuite jusqu'à 48 h avant · Paiement sécurisé Stripe · CGV » sous le bouton ; emoji 🎁 remplacé par icône `Gift` — `reserve-form.tsx`
- [x] **Email de bienvenue lead** — envoyé à la 1ʳᵉ capture (rappel remise + application auto), `claimMysteryDiscount` renvoie `isNew` — `lib/leads.ts`, `app/api/leads/route.ts`, `lib/email.ts`, `lib/email-template.ts`
- [x] **Relance panier abandonné** — sur `checkout.session.expired`, email de re-réservation (non bloquant, si atelier encore publié) — `app/api/stripe/webhook/route.ts`, `lib/email.ts`, `lib/email-template.ts`

**Bonus livré hors liste :** lien « Admin » dans le menu Clerk (visible si admin, via route `/api/me/admin`, layout resté statique).

**Vérifié :** `tsc --noEmit` 0 erreur · `vitest` 18/18 · `eslint` 0 erreur.
**Pas encore vérifié :** rendu navigateur, envoi réel des emails (dépend de la vérif domaine Resend), event Stripe réel.

---

## P1 — À FAIRE (fort impact, ~2 semaines)

- [ ] **Preuve sociale** (manque n°1) — témoignages avec photo des créations, bloc entre `SessionsBoard` et `Promesse` + 1 témoignage près du CTA sticky de la fiche
- [ ] **Section « Comment ça marche »** en 3 étapes (Choisis → Réserve en 2 min → Repars avec ta création) sur la landing
- [ ] **Bloc « inclus dans le prix »** sur fiche + ticket réservation (matériel, encadrement, **conso du lieu**)
- [ ] **Mettre en avant le lieu hôte** sur la fiche (nom/photo du resto-boulangerie, « boisson/pâtisserie incluse »)
- [ ] **SEO P0 technique** :
  - [ ] `generateMetadata` sur `/ateliers/[id]` (titles actuellement tous identiques)
  - [ ] `app/sitemap.ts` + `app/robots.ts` (admin/billets/merci sont indexables aujourd'hui)
  - [ ] `metadataBase` + `alternates.canonical`
  - [ ] `app/opengraph-image` + bloc `openGraph`/`twitter` (le bouton de partage existe déjà)
- [ ] **JSON-LD** : `Event` par session (rich results Google), `LocalBusiness`, `FAQPage` (FAQ déjà en dur dans `Faq.tsx`)
- [ ] **Réduire le hold des places** : 30 min → 10–15 min (`checkout/route.ts`) pour éviter les faux « Complet »
- [ ] **Waitlist atelier complet** : remplacer le 404/erreur par capture email « préviens-moi si une place se libère »

---

## P2 — À FAIRE (moyen terme, le mois suivant)

- [ ] **Rappel J-1** avant l'atelier (lieu, horaire, QR) — nécessite un cron/scheduled
- [ ] **Email post-atelier J+1** : avis Google + cross-sell prochain atelier
- [ ] **`allow_promotion_codes: true`** au checkout + capture **UTM** (colonne `source` sur leads/bookings) — prérequis avant toute pub payante
- [ ] **Parrainage** simple (−10 % filleul / −10 % parrain, réutilise l'infra coupons Stripe)
- [ ] **Pages SEO** par catégorie (bijoux, mosaïque…) et par ville/quartier — chaque commerce hôte = opportunité locale + cross-promo (QR code en boutique)
- [ ] **ISR** (`revalidate: 60`) au lieu de `force-dynamic` sur `/` et `/ateliers/[id]` ; restreindre `images.remotePatterns` au domaine Supabase
- [ ] **Back-office** : vue réservations + leads + taux d'utilisation des remises (données déjà en base)

---

## Chantier transverse — Animations « premium malgré le playground »

Problème = **incohérence**, pas le style. (Détail dans l'audit UX.)

- [ ] **Tokens motion centralisés** (`lib/motion.ts`) : 1 ease, 3 durées (fast/base/slow), 2 springs nommés ; dédupliquer l'`EASE` répété dans 4 fichiers
- [ ] **Skeletons** : `app/loading.tsx` + skeletons de cartes (la home `force-dynamic` montre un écran vide)
- [ ] **Transitions de page** (`template.tsx`) + **shared element** photo carte → fiche atelier
- [ ] **Micro-interactions** : press/hover scale sur cartes, animation « coup de tampon » sur COMPLET, indicateur `layoutId` sur le DayStrip, FAQ animée
- [ ] **Dégraisser la pop-up mystère** (CTA visible trop tard ~1,35 s, trop de boucles infinies = jank mobile)
- [ ] **A11y/technique** : focus trap pop-up, touch targets 36→44 px, `prefers-reduced-motion` pour les `animate-*` CSS, supprimer le code mort (`Stagger`/`Pop`/`Floaty`), MAJ `design-system/MASTER.md` (obsolète)

---

## Idées de tests A/B (quand le trafic le permet)

- Hero H1 : promesse vs « dès X € » orienté prix
- Carte accordéon vs carte = lien direct (supprimer le clic d'ouverture)
- Pop-up mystère : 8 s vs exit-intent
- CTA paiement : « Payer X € » vs « Réserver ma place — X € »

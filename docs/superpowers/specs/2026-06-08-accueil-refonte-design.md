# Accueil — Refonte (design validé)

> Date : 2026-06-08 · Slug : `accueil-refonte`
> Contexte : pivot design system « crème + navy + cartes contournées » (réf. « Tes progrès »).
> Cette spec ne couvre QUE l'accueil (`app/page.tsx`) et ses dépendances directes.

## 1. Objectif
Refondre l'accueil : retirer « Comment ça marche », passer le sélecteur de jours en
**semaine glissante lun→dim**, donner aux cartes une **tête de ticket**, ajouter des
**sections du milieu**, et **mettre en cache** la liste pour ne plus taper la base à
chaque visite.

## 2. Structure (haut → bas)
1. En-tête éditorial (eyebrow + titre + sous-titre), restylé crème/navy.
2. **Slider de jours** (semaine glissante).
3. **Featured + liste** en cartes-tickets.
4. **La promesse** (carte bleu royal forte).
5. **FAQ** (`<details>` natifs).
6. **Reste informé** (CTA création de compte).
7. Footer global.

« Comment ça marche » est **supprimé**. État vide (aucun atelier) : masquer slider +
liste, garder Promesse + FAQ + Reste informé (jamais vide).

## 3. Slider de jours — semaine glissante
- Bande horizontale continue de cellules **lun→dim** avec vraies dates, du lundi de la
  1ʳᵉ semaine ayant un atelier au dimanche de la dernière (cap de garde : 26 semaines).
- Cellule = `LUN` + `15`. Jour avec atelier = cliquable, actif en **ambre** ; jour sans
  atelier = grisé, `disabled`. Bouton **« Tous »** au début (défaut).
- Scroll horizontal ←→ ; auto-scroll au chargement vers le 1ᵉʳ jour ayant un atelier.
  Séparateur discret en début de semaine.
- Filtrage **client-side** (données déjà chargées) → zéro appel réseau au tap.
- Nouveau helper pur `buildWeekStrip(sessions): DayCell[]` dans `lib/dates.ts`
  (`DayCell = { key; iso; hasSession }`), construit en heure locale (midi) pour éviter
  les décalages de fuseau.

## 4. Cartes ateliers = ticket à talon perforé
- `AtelierCard` : **talon gauche** (n° jour + mois, fond pastel rotatif
  menthe/bleu/ambre/corail) séparé du corps par une **perforation pointillée verticale +
  2 encoches** (haut/bas, creusées en couleur `--color-background`).
- Corps : titre, ligne `prix · X places` (places réelles via `placesRestantes`) ; si 0 →
  badge **« Complet »**. `arrow-fab` à droite.
- Carte blanche contour navy (`overflow-hidden` pour clipper talon + encoches).
- Nouvelles classes CSS : `.stub-divider` (+ `::before`/`::after` encoches).
- Helper `stubToneForIndex(i)` dans `lib/ui.ts`.
- `FeaturedSession` conservé (grande carte bleu royal), rebasculé sur le DS courant.

## 5. Sections du milieu
- **Promesse** (`components/Promesse.tsx`) : carte `tone-brand` pleine, phrase forte
  « Écrire, ensemble, sans pression. » + 3 points (petits groupes · tous niveaux · tu
  repars avec un texte). Aucune donnée inventée.
- **FAQ** (`components/Faq.tsx`) : 4 `<details>` stylés en cartes contournées (niveau
  requis · lieu · annulation · paiement sécurisé). Zéro JS, accessibles.
- **Reste informé** (`components/RestePrevenu.tsx`) : carte ambre, « Sois prévenu des
  prochaines dates » → bouton **Créer un compte** (`/sign-up`).

## 6. Cache & garde-fous (Next 16, Cache Components OFF → modèle legacy)
- `lib/sessions.ts` : `listPublishedSessions` enveloppé dans **`unstable_cache`**
  (`revalidate: 300`, `tags: ["sessions"]`). La base n'est plus tapée à chaque requête.
- `app/page.tsx` : retirer `export const dynamic = "force-dynamic"`, ajouter
  `export const revalidate = 300` (ISR).
- Garde-fou « spam » : filtrage par jour 100% client → aucune requête déclenchée par
  l'interaction. (Rate-limit API réservation = hors-scope, noté pour plus tard.)
- `buildWeekStrip` borné à 26 semaines (garde-fou rendu).

## 7. Fichiers
- **Modifiés** : `app/page.tsx`, `components/SessionsBoard.tsx`, `components/DayStrip.tsx`,
  `components/AtelierCard.tsx`, `lib/dates.ts`, `lib/sessions.ts`, `lib/ui.ts`,
  `app/globals.css`.
- **Nouveaux** : `components/Promesse.tsx`, `components/Faq.tsx`,
  `components/RestePrevenu.tsx`.

## 8. Risques
- Si Clerk rendait la route dynamique, l'ISR ne s'appliquerait pas — d'où `unstable_cache`
  au niveau requête (garantit le cache base quel que soit le mode de rendu).
- Strip très long si ateliers très étalés → cap 26 semaines + auto-scroll au 1ᵉʳ jour utile.

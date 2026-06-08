# Refonte nav bar + logo

Date : 2026-06-09
Branche : `feat/refonte-billetterie`

## Contexte

La nav bar globale (`components/Header.tsx`) et le wordmark (`components/Logo.tsx`)
ne sont pas alignés avec la direction de design de l'app (éditoriale, épurée,
aplats unis, fort contraste — aucun dégradé ni effet). Deux problèmes confirmés
avec l'utilisateur :

1. **Le header en « verre dépoli »** (`bg-white/40 backdrop-blur-xl backdrop-saturate-150`)
   jure avec l'esthétique aplat/contraste et manque de netteté.
2. **Le wordmark déséquilibré** : à `text-2xl`, les mots latéraux « Atelier des »
   et « histoires » tombent à ~11px (0.46em), illisibles ; le « 100 » écrase le reste.

Non retenus comme problèmes : la séparation header/page (sera réglée par la
bordure franche) et le bouton « Connexion » (convient tel quel).

## Objectif

Une nav bar nette et un logo équilibré, cohérents avec le design system
(`app/globals.css`), sans introduire de nouvelle page, menu, ni symbole/favicon.
Le wordmark reste textuel.

## Périmètre

### 1. Logo — `components/Logo.tsx` (direction « empilé éditorial »)

Refonte de la structure du composant `Logo`, de inline-baseline vers une
disposition **en colonne** :

- Ligne 1 — sur-titre « ATELIER DES » : petit, gras, majuscules, lettrage espacé
  (esprit `.eyebrow`).
- Ligne 2 — ligne forte « **100** histoires » : grande, `font-black`, le « 100 »
  porte l'accent bleu.

Contraintes :

- **Taille pilotée par la `font-size` du parent** (valeurs en `em`), pour que
  `className="text-2xl"` continue de fonctionner au header comme au footer. Les
  deux lignes scalent ensemble.
- Police d'affichage conservée (`font-display`, Nunito), `tracking` serré sur la
  ligne forte.
- **Deux tons conservés** (API inchangée : prop `tone: "dark" | "light"`) :
  - `tone="dark"` (fond clair / header) : sur-titre `text-muted`,
    « 100 » `text-brand-ink`, « histoires » `text-foreground`.
  - `tone="light"` (fond encre / footer) : sur-titre `text-on-ink/70`,
    « 100 » `text-brand`, « histoires » `text-on-ink`.
- `LogoLink` (wrapper `<Link href="/">` cliquable + `aria-label`) : signature et
  comportement inchangés ; il enveloppe simplement le nouveau `Logo`.

Consommateurs (ne pas modifier leur appel) :
- `components/Header.tsx` → `<LogoLink className="text-2xl" />`
- `components/Footer.tsx` → `<Logo tone="light" className="text-2xl" />`

### 2. Header — `components/Header.tsx` (barre nette)

- Supprimer `bg-white/40 backdrop-blur-xl backdrop-saturate-150` et
  `border-white/30`.
- Remplacer par un **aplat crème opaque** `bg-background` + **bordure encre
  franche** en bas `border-b-[1.5px] border-ink`.
- Inchangé : `sticky top-0 z-30`, conteneur `.screen flex h-16 items-center
  justify-between`, le CTA « Connexion » (`signed-out`) et le `UserButton`
  (`signed-in`), et le masquage du header sur les routes `/ateliers/*`
  (`if (pathname?.startsWith("/ateliers/")) return null;`).

## Hors périmètre

- Aucun menu de navigation, aucune nouvelle page.
- Aucun symbole/icône/favicon — le logo reste un wordmark textuel.
- Aucune modification du footer hormis le rendu hérité du nouveau `Logo`.

## Critères de réussite

- Le header s'affiche en aplat crème opaque avec une bordure encre nette, sans
  flou ni transparence.
- Le logo affiche « ATELIER DES » en sur-titre puis « 100 histoires » en gros,
  lisible et équilibré, au header (ton sombre) comme au footer (ton clair).
- `text-2xl` reste le levier de taille ; aucun appel consommateur n'est cassé.
- Le header reste masqué sur `/ateliers/*`.

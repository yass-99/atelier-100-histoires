# Design System — Atelier des 100 histoires

> Source de vérité visuelle. Style **« Vibrant & arrondi / playful »**, mobile-first.
> Palette tirée de la référence fournie. Implémenté en tokens Tailwind v4
> dans `app/globals.css`. Aperçu live : route `/styleguide`.

## Principes
- **Mobile-first** : tout se conçoit d'abord en largeur ~375px. Conteneur `.screen` (`max-w-md`, centré).
- **Cartes blanches très arrondies** sur fond lavande, ombres douces.
- **CTA principal = pilule noire** (`.btn-primary`) — meilleur contraste, fidèle à la référence.
- Couleurs vives utilisées comme **surfaces** (avec texte foncé), pas comme texte.
- Icônes : SVG (Lucide), **jamais d'emoji**. Cibles tactiles ≥ 44px.

## Couleurs (tokens → utilitaires Tailwind)
| Rôle | Token | Hex | Utilitaires |
|------|-------|-----|-------------|
| Fond d'app | `--color-background` | `#f1f4fd` | `bg-background` |
| Lavande soutenu | `--color-lavender` | `#c9d6f7` | `bg-lavender` |
| Surface (carte) | `--color-surface` | `#ffffff` | `bg-surface` |
| Texte principal | `--color-foreground` | `#15151b` | `text-foreground` |
| Texte secondaire | `--color-muted` | `#6f7280` | `text-muted` |
| Bordure | `--color-border` | `#e9ecf6` | `border-border` |
| Noir (CTA pilule) | `--color-ink` | `#111114` | `bg-ink` `text-ink` |
| Sur noir | `--color-on-ink` | `#ffffff` | `text-on-ink` |
| Marque (bleuet) | `--color-brand` | `#7c93f0` | `bg-brand` `text-brand` |
| Bleu pastel | `--color-brand-soft` | `#c6d8fa` | `bg-brand-soft` |
| Magenta vif | `--color-magenta` | `#e24fd8` | `bg-magenta` |
| Rose pastel | `--color-magenta-soft` | `#f3c9e9` | `bg-magenta-soft` |
| Ambre | `--color-amber` | `#f4b63f` | `bg-amber` |
| Orange | `--color-orange` | `#ff7a29` | `bg-orange` |
| Succès | `--color-success` | `#2fb67c` | `bg-success` |
| Danger | `--color-danger` | `#e5484d` | `bg-danger` |

**Règle de contraste** : texte foncé (`text-ink`/`text-foreground`) sur surfaces claires
(brand, brand-soft, amber, magenta-soft, lavender). Texte blanc uniquement sur `ink`,
`magenta`, `orange`, `success`, `danger`.

## Typographie
- **Titres (display)** : Nunito 800 → `font-display` (appliqué d'office sur `h1–h4`).
- **Corps** : DM Sans 400/500/700 → `font-sans` (police par défaut du `body`).
- Échelle : `text-sm` (légende) · `text-base` (corps, 16px) · `text-xl/2xl/3xl` (titres).
- Chargées via `next/font` dans `app/layout.tsx` (variables `--font-nunito`, `--font-dm-sans`).

## Rayons & ombres
| Token | Valeur | Utilitaire |
|-------|--------|-----------|
| `--radius-md` | 14px | `rounded-md` |
| `--radius-lg` | 20px | `rounded-lg` |
| `--radius-card` | 28px | `rounded-card` |
| `--radius-pill` | 9999px | `rounded-pill` |
| `--shadow-soft` | ombre légère | `shadow-soft` |
| `--shadow-card` | ombre carte | `shadow-card` |
| `--shadow-pop` | ombre magenta | `shadow-pop` |

## Classes de composants (dans `globals.css`)
- **Boutons** : `.btn-primary` (noir), `.btn-brand` (bleuet), `.btn-accent` (magenta), `.btn-ghost` (contour). Tous ≥ 44px.
- **Cartes** : `.card` (ombrée), `.card-flat` (bordure).
- **Étiquettes** : `.chip` (pastille arrondie), `.badge` (petit badge de statut).
- **Layout** : `.screen` (conteneur mobile centré).

## Espacement
Système 4/8px de Tailwind (`p-4`, `gap-3`, `mt-8`…). Rythme vertical des sections : 24–32px.

## À faire plus tard
- Variante **dark mode** (les tokens sont prêts à être dupliqués).
- Vérifier le domaine pour les emails (Resend) avant prod.

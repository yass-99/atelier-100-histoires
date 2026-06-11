# Design System — Atelier des 100 histoires

> Source de vérité visuelle. Direction **éditoriale, épurée, fort contraste**
> (encre quasi-noire + papier crème), **aplats de couleur unis (aucun dégradé)**,
> mobile-first, une action claire par écran. Tokens Tailwind v4 dans
> `app/globals.css`. Tokens de mouvement dans `lib/motion.ts`. Aperçu live : route `/styleguide`.

## Principes
- **Mobile-first** : tout se conçoit d'abord en largeur ~375px. Conteneur `.screen` (`max-w-md`, centré).
- **Cartes blanches contournées** (liseré encre net) sur fond crème, ombres sobres.
- **CTA principal = pilule noire** (`.btn-primary`) — contraste maximal.
- Couleurs vives utilisées comme **surfaces** (texte foncé dessus), pas comme texte.
- Icônes : SVG (Lucide), **jamais d'emoji**. Cibles tactiles **≥ 44px**.
- **Aucun dégradé**, aucun décor « blob » (déprécié, supprimé).

## Couleurs (tokens → utilitaires Tailwind)
| Rôle | Token | Hex | Utilitaires |
|------|-------|-----|-------------|
| Fond d'app (papier) | `--color-background` | `#fbf5e4` | `bg-background` |
| Bleu doux (aplat) | `--color-lavender` | `#d7dcfb` | `bg-lavender` |
| Surface (carte) | `--color-surface` | `#ffffff` | `bg-surface` |
| Texte principal | `--color-foreground` | `#1b2238` | `text-foreground` |
| Texte secondaire | `--color-muted` | `#6c7180` | `text-muted` |
| Bordure douce | `--color-border` | `#e7e0cd` | `border-border` |
| Encre (CTA, contours) | `--color-ink` | `#121317` | `bg-ink` `text-ink` |
| Sur encre | `--color-on-ink` | `#ffffff` | `text-on-ink` |
| Marque (bleu royal) | `--color-brand` | `#3b4ed8` | `bg-brand` |
| Bleu pastel | `--color-brand-soft` | `#e0e4fb` | `bg-brand-soft` |
| Bleu lisible | `--color-brand-ink` | `#2f3ec7` | `text-brand-ink` |
| Corail | `--color-magenta` | `#e0566f` | `bg-magenta` |
| Rose pastel | `--color-magenta-soft` | `#fce3ea` | `bg-magenta-soft` |
| Ambre (actif/badge) | `--color-amber` | `#f4b63c` | `bg-amber` |
| Ambre pastel | `--color-amber-soft` | `#fbe7b6` | `bg-amber-soft` |
| Vert / succès | `--color-mint` · `--color-success` | `#1f9d5f` | `bg-mint` `bg-success` |
| Lime | `--color-lime` | `#c4e759` | `bg-lime` |
| Orange | `--color-orange` | `#ff7a29` | `bg-orange` |
| Danger | `--color-danger` | `#e5484d` | `bg-danger` |

**Règle de contraste** : texte foncé (`text-ink`/`text-foreground`) sur surfaces claires
(brand-soft, amber, magenta-soft, lavender, lime). Texte blanc sur `ink`, `brand`,
`magenta`, `orange`, `success`, `danger`.

## Typographie
- **Titres (display)** : Nunito 700/800/900 → `font-display` (appliqué d'office sur `h1–h4`).
- **Corps** : DM Sans 400/500/700 → `font-sans` (police par défaut du `body`).
- Chargées via `next/font` dans `app/layout.tsx` (variables `--font-nunito`, `--font-dm-sans`).

## Rayons & ombres
| Token | Valeur | Utilitaire |
|-------|--------|-----------|
| `--radius-sm` | 10px | `rounded-sm` |
| `--radius-md` | 16px | `rounded-md` |
| `--radius-lg` | 22px | `rounded-lg` |
| `--radius-card` | 28px | `rounded-card` |
| `--radius-pill` | 9999px | `rounded-pill` |
| `--shadow-soft` / `-card` / `-pop` / `-lift` | ombres sobres | `shadow-soft`… |
| `--shadow-emboss` | liseré gravé (incrustation) | `shadow-emboss` |

## Classes de composants (dans `globals.css`)
- **Boutons** (tous ≥ 44px) : `.btn-primary` (encre), `.btn-brand`, `.btn-accent` (magenta), `.btn-amber`, `.btn-lime`, `.btn-outline`, `.btn-ghost`.
- **Cartes** : `.card` (ombrée, contour encre), `.card-flat` (bordure douce).
- **Étiquettes** : `.chip`, `.badge`, `.eyebrow`, `.mark` (surligneur).
- **Spécifiques** : `.ticket`/`.ticket-perf`/`.perf-notch` (e-ticket), `.stamp` (tampon COMPLET), `.day-pill` (filtre jour), `.faq-item`, `.field`, `.skeleton`.
- **Layout** : `.screen`, `.sheet`, `.arrow-fab`, `.circle-btn`.

## Espacement
Système 4/8px (`p-4`, `gap-3`, `mt-8`…). Rythme vertical des sections : 24–48px.

---

## Motion

Source unique : **`lib/motion.ts`** (constantes pures, importables serveur + client).
**Règle : ne jamais redéfinir une courbe / durée / spring en local — importer les tokens.**

| Token | Valeur | Usage |
|-------|--------|-------|
| `EASE` | `[0.22, 1, 0.36, 1]` | ease-out maison (toutes les transitions tween) |
| `DURATION.fast / base / slow` | `0.2 / 0.32 / 0.5` s | micro-interactions / courant / apparitions |
| `SPRING_SNAPPY` | `stiffness 320, damping 24` | feedback UI direct (press, indicateurs, compteurs) |
| `SPRING_SOFT` | `stiffness 260, damping 20` | apparitions/révélations « qui se posent » |
| `T_FAST / T_BASE / T_SLOW` | `{ duration, ease: EASE }` | presets tween prêts à l'emploi |
| `fadeUp` · `staggerContainer` · `staggerItem` | variants | apparition fondu+glissé · cascade |

### In-page (Framer Motion)
- `MotionProvider` (`components/motion.tsx`) enveloppe l'app avec `MotionConfig reducedMotion="user"` — **toutes** les animations Framer respectent « réduire les animations ».
- `Reveal` : apparition à l'entrée à l'écran (le motif standard).
- Micro-interactions : `AtelierCard` (hover lift + press scale, `SPRING_SNAPPY`) ; `CompleteSignal` (« coup de cachet » à l'apparition) ; `DayStrip` (indicateur actif `layoutId="day-active"` qui glisse) ; `Faq` (ouverture `AnimatePresence` hauteur + chevron animé).

### Niveau route (View Transitions API native)
Activé par `experimental.viewTransition: true` (`next.config.ts`) ; `<ViewTransition>` importé depuis `react` (React canary embarqué par Next ; types via `react-view-transitions.d.ts`).
- **Transitions de page** : `app/template.tsx` mappe les types `nav-forward` / `nav-back` sur des slides directionnels. Le sens est porté par `transitionTypes` sur les `<Link>` (`nav-forward` vers une fiche/réservation, `nav-back` vers les retours).
- **Shared element** : la photo de la carte « À la une » morphe vers la fiche via `<ViewTransition name={`atelier-photo-${id}`} share="morph">` (hero `HeroAlaUne` + hero de `app/ateliers/[id]/page.tsx`).
- **Header ancré** : `viewTransitionName: "site-header"` → il ne glisse pas pendant la transition.
- CSS associé (keyframes, morph, ancrage, reduced-motion) dans `app/globals.css`.

### Skeletons & chargement
- `.skeleton` (shimmer CSS) + `components/skeletons.tsx`.
- `app/loading.tsx`, `app/ateliers/loading.tsx`, `app/ateliers/[id]/loading.tsx`.
- `DiscountBannerSlot` (fetch remise) est enveloppé d'un `<Suspense>` dans le layout pour **débloquer** l'affichage de `loading.tsx` (sinon l'`await` du layout bloque le shell).

### Accessibilité du mouvement
- **Reduced-motion** : Framer via `MotionConfig` ; CSS via le bloc `@media (prefers-reduced-motion: reduce)` (coupe `animate-*`, fige les `::view-transition-*` et le shimmer).
- **Pop-up mystère** : focus piégé (Tab/Shift+Tab), focus initial sur la carte, restauré à la fermeture ; Échap ferme.
- **Cibles tactiles ≥ 44px** partout (boutons, flèches, fermetures).

## À faire plus tard
- Variante **dark mode** (les tokens sont prêts à être dupliqués).
- Vérifier le domaine pour les emails (Resend) avant prod.

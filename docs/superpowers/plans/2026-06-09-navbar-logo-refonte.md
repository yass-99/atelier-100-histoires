# Refonte nav bar + logo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aligner la nav bar globale et le wordmark sur la direction de design de l'app (éditoriale, aplats unis, fort contraste) — header net + logo « empilé éditorial » équilibré.

**Architecture :** Deux composants présentés, modifiés indépendamment. `components/Logo.tsx` passe d'un wordmark inline déséquilibré à une disposition en colonne (sur-titre + ligne forte), taille toujours pilotée par la `font-size` parent (em), deux tons (`dark`/`light`) conservés. `components/Header.tsx` perd l'effet verre dépoli au profit d'un aplat crème opaque borduré encre. API publique inchangée → aucun consommateur (`Header`, `Footer`) à toucher dans son appel.

**Tech Stack :** Next.js 16 (App Router), React 19, Tailwind CSS v4 (design tokens dans `app/globals.css`), TypeScript.

**Note sur la vérification :** le projet n'a aucun harnais de test de composant (pas de `@testing-library/react`/jsdom ; `vitest` n'est câblé sur aucun test du repo). Pour ce changement purement visuel, la vérification se fait par `npm run lint`, le typecheck `npx tsc --noEmit`, et un contrôle visuel dans `npm run dev`. On n'ajoute pas d'infrastructure de test (YAGNI, hors périmètre).

**Spec de référence :** `docs/superpowers/specs/2026-06-09-navbar-logo-refonte-design.md`

---

## File Structure

- `components/Logo.tsx` — **modifié** : `Logo` réécrit en disposition empilée (2 tons) ; `LogoLink` inchangé.
- `components/Header.tsx` — **modifié** : classes du `<header>` (aplat opaque + bordure encre) ; reste du composant inchangé.
- Non modifiés (consommateurs, API stable) : `components/Footer.tsx`, tout appelant de `LogoLink`.

---

## Task 1: Logo empilé éditorial (`components/Logo.tsx`)

**Files:**
- Modify: `components/Logo.tsx` (fonction `Logo`, lignes 13-31)

- [ ] **Step 1: Réécrire la fonction `Logo` en disposition empilée**

Remplacer la fonction `Logo` existante (de `export function Logo({` jusqu'à sa `}` de fermeture, avant `LogoLink`) par :

```tsx
/**
 * Wordmark « Atelier des 100 histoires » — empilé éditorial.
 * Sur-titre « ATELIER DES » discret, puis ligne forte « 100 histoires »
 * où le « 100 » porte l'accent bleu.
 * La taille se pilote par la font-size du parent (className text-*) :
 * la ligne forte vaut 1em, le sur-titre ~0.42em.
 *
 * tone="dark"  → sur fond clair (header crème)
 * tone="light" → sur fond foncé (footer encre)
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: Tone;
}) {
  const eyebrow = tone === "light" ? "text-on-ink/70" : "text-muted";
  const accent = tone === "light" ? "text-brand" : "text-brand-ink";
  const strong = tone === "light" ? "text-on-ink" : "text-foreground";
  return (
    <span
      className={`inline-flex flex-col font-display leading-none ${className ?? ""}`}
    >
      <span className={`text-[0.42em] font-bold uppercase tracking-[0.16em] ${eyebrow}`}>
        Atelier&nbsp;des
      </span>
      <span className={`mt-[0.14em] font-black tracking-[-0.03em] ${strong}`}>
        <span className={accent}>100</span>&nbsp;histoires
      </span>
    </span>
  );
}
```

Laisser `LogoLink` (lignes 34-46) et la déclaration `type Tone` (ligne 3) tels quels.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit; npm run lint`
Expected: aucune erreur (le composant garde la même signature : props `className?`, `tone?`).

- [ ] **Step 3: Contrôle visuel**

Run: `npm run dev` puis ouvrir `http://localhost:3000/`.
Expected (header, ton sombre sur crème) : « ATELIER DES » en petit sur-titre majuscules gris au-dessus de « **100** histoires » en gros, le « 100 » en bleu, le reste en navy. Lisible et équilibré.

- [ ] **Step 4: Commit**

```bash
git add components/Logo.tsx
git commit -m "feat(logo): wordmark empile editorial (sur-titre + ligne forte 100 histoires)"
```

---

## Task 2: Header net (aplat opaque + bordure encre) (`components/Header.tsx`)

**Files:**
- Modify: `components/Header.tsx:15` (la ligne `<header className=...>`)

- [ ] **Step 1: Remplacer les classes du `<header>`**

Remplacer cette ligne :

```tsx
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/40 backdrop-blur-xl backdrop-saturate-150">
```

par :

```tsx
    <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-background">
```

Ne rien changer d'autre dans le fichier (le masquage sur `/ateliers/*`, le conteneur `.screen`, le `LogoLink`, le CTA `Connexion` et le `UserButton` restent identiques).

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit; npm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Contrôle visuel**

Run: `npm run dev` puis ouvrir `http://localhost:3000/`.
Expected : header en aplat crème opaque (même teinte que la page) séparé par une bordure encre franche en bas, **sans** flou ni transparence. En scrollant, le contenu ne transparaît pas sous le header (fond opaque). Le header reste collé en haut. Vérifier qu'il est toujours **absent** sur une page `/ateliers/<id>`.

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx
git commit -m "feat(header): barre nette aplat creme + bordure encre (fin du verre depoli)"
```

---

## Task 3: Vérification du ton clair au footer

**Files:**
- Aucun fichier modifié — vérification de non-régression du `Logo` réutilisé dans `components/Footer.tsx:13` (`<Logo tone="light" />`).

- [ ] **Step 1: Contrôle visuel du footer**

Run: `npm run dev` puis ouvrir `http://localhost:3000/` et descendre au footer (fond encre).
Expected : « ATELIER DES » en sur-titre clair (`on-ink/70`), « **100** histoires » avec « 100 » en bleu (`brand`) et « histoires » en blanc (`on-ink`), bien lisible sur fond sombre, aligné à gauche.

- [ ] **Step 2: (si régression) ajuster les tons dans `Logo`**

Si le contraste du footer est insuffisant, revoir les classes `eyebrow`/`accent`/`strong` du bloc `tone === "light"` dans `components/Logo.tsx` (Task 1, Step 1). Sinon, ne rien faire.

---

## Self-Review

- **Couverture spec :**
  - Logo direction « empilé éditorial », em-based, 2 tons → Task 1. ✓
  - Header aplat crème opaque + bordure encre, suppression verre dépoli, reste inchangé (sticky, `.screen`, CTA, masquage `/ateliers/*`) → Task 2. ✓
  - `LogoLink` et appels consommateurs inchangés → garanti par signature stable (Task 1) ; footer vérifié → Task 3. ✓
  - Hors périmètre (pas de menu, page, symbole/favicon) → respecté, aucune tâche n'en ajoute. ✓
- **Placeholders :** aucun ; tout le code à coller est fourni intégralement.
- **Cohérence des types/noms :** props `className?`/`tone?` et `type Tone` identiques à l'existant ; classes Tailwind référencent des tokens réels de `app/globals.css` (`text-muted`, `text-on-ink`, `text-brand`, `text-brand-ink`, `text-foreground`, `border-ink`, `bg-background`). ✓

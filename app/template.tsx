import { ViewTransition } from "react";

/**
 * Transitions de page. Le `template` se remonte à chaque navigation, ce qui
 * permet au `<ViewTransition>` d'animer le changement de route.
 *
 * Le sens est porté par `transitionTypes` sur les `<Link>` :
 *   - `nav-forward` (on entre plus profond) → glisse vers la gauche
 *   - `nav-back` (on revient en arrière) → glisse vers la droite
 * Sans type (chargement initial, retour navigateur) → aucun mouvement, et le
 * morph de la photo carte « À la une » → fiche reste actif via son `name`.
 * CSS associé dans app/globals.css. Reduced-motion géré globalement.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}

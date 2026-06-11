"use client";
import { useEffect } from "react";

/**
 * Borne la page à la hauteur exacte du viewport tant qu'elle est montée :
 * le body ne défile plus, et la chaîne flex (#main-content → page → liste)
 * peut créer une zone de scroll interne. Résultat : le footer reste figé en
 * bas de l'écran quel que soit le nombre de cartes.
 *
 * Styles inline (et non classes Tailwind) pour ne pas dépendre de la
 * génération JIT d'une classe utilisée nulle part ailleurs (ex. `h-dvh`).
 * Le cleanup restaure le comportement par défaut au démontage (navigation).
 */
export function ViewportLock() {
  useEffect(() => {
    const body = document.body;
    const prev = { height: body.style.height, overflow: body.style.overflow };
    body.style.height = "100dvh";
    body.style.overflow = "hidden";
    return () => {
      body.style.height = prev.height;
      body.style.overflow = prev.overflow;
    };
  }, []);
  return null;
}

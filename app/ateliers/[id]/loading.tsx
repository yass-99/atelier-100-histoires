import { FicheSkeleton } from "@/components/skeletons";

/** Écran d'attente de la fiche atelier (le contenu prend le relais via le
    « Suspense reveal » des View Transitions). */
export default function Loading() {
  return <FicheSkeleton />;
}

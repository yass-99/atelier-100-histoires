import { HeroSkeleton, CardListSkeleton } from "@/components/skeletons";

/** Écran d'attente de la home (et fallback global) — évite la page vide pendant
    le rendu dynamique. */
export default function Loading() {
  return (
    <main className="screen space-y-12 py-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="skeleton block h-3 w-40 rounded-full" />
          <span className="skeleton block h-7 w-3/4 rounded-md" />
        </div>
        <HeroSkeleton />
      </div>
      <div className="space-y-3">
        <span className="skeleton block h-7 w-1/2 rounded-md" />
        <CardListSkeleton count={4} />
      </div>
    </main>
  );
}

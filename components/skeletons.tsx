/**
 * Skeletons d'attente (shimmer CSS `.skeleton`, défini dans globals.css et
 * neutralisé sous `prefers-reduced-motion`). Composants serveur purs, utilisés
 * par les `loading.tsx` pour éviter l'écran vide pendant le rendu dynamique.
 */

/** Bloc shimmer générique : la forme/rayon vient des utilitaires Tailwind. */
function Block({ className = "" }: { className?: string }) {
  return <span className={`skeleton block ${className}`} />;
}

/** Squelette d'une carte atelier (talon date + contenu + flèche). */
export function CardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-card border-[1.5px] border-ink bg-surface shadow-soft">
      <div className="skeleton w-16 shrink-0" />
      <div className="flex-1 space-y-2.5 p-3.5">
        <Block className="h-4 w-2/3 rounded-md" />
        <Block className="h-3 w-1/3 rounded-md" />
      </div>
      <Block className="m-3.5 h-12 w-12 shrink-0 rounded-full" />
    </div>
  );
}

/** Squelette du hero « À la une » (carrousel plein-cadre). */
export function HeroSkeleton() {
  return <div className="skeleton h-72 w-full rounded-card border-[1.5px] border-ink" />;
}

/** Liste de cartes (agenda). */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Squelette de la fiche atelier (hero photo + feuille de contenu). */
export function FicheSkeleton() {
  return (
    <main className="screen">
      <div className="skeleton -mx-4 h-56 rounded-b-[2rem] border-b-[1.5px] border-ink" />
      <div className="sheet min-h-[calc(100dvh-16rem)] space-y-4 pb-28">
        <Block className="h-6 w-28 rounded-full" />
        <Block className="h-8 w-3/4 rounded-md" />
        <Block className="h-4 w-1/2 rounded-md" />
        <div className="card mt-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Block key={i} className="h-10 rounded-md" />
          ))}
        </div>
      </div>
    </main>
  );
}

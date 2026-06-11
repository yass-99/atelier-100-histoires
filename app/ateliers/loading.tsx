import { CardListSkeleton } from "@/components/skeletons";

/** Écran d'attente de l'agenda complet. */
export default function Loading() {
  return (
    <main className="screen flex min-h-0 flex-1 flex-col py-6">
      <div className="shrink-0 space-y-2">
        <span className="skeleton block h-3 w-36 rounded-full" />
        <span className="skeleton block h-7 w-2/3 rounded-md" />
      </div>
      {/* Bande de jours */}
      <div className="mt-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="skeleton h-14 w-14 shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="mt-4">
        <CardListSkeleton count={6} />
      </div>
    </main>
  );
}

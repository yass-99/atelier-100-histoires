import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "CGV — Atelier aux 100 histoires" };

export default function Cgv() {
  return (
    <main className="screen py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        Accueil
      </Link>

      <div className="card mt-4 space-y-3">
        <h1 className="font-display text-2xl">Conditions générales de vente</h1>
        <p className="text-muted">[À COMPLÉTER — gabarit indicatif, à faire valider.]</p>
        <h2 className="font-display text-lg">Objet</h2>
        <p className="text-foreground/90">
          Les présentes CGV régissent la vente de places aux ateliers proposés par l’organisateur.
        </p>
        <h2 className="font-display text-lg">Prix et paiement</h2>
        <p className="text-foreground/90">
          Les prix sont indiqués en euros TTC. Le paiement s’effectue en ligne via Stripe.
        </p>
        <h2 className="font-display text-lg">Annulation et remboursement</h2>
        <p className="text-foreground/90">
          [À COMPLÉTER — politique d’annulation. En l’absence de remboursement automatique, préciser les modalités.]
        </p>
        <h2 className="font-display text-lg">Droit de rétractation</h2>
        <p className="text-foreground/90">
          [À COMPLÉTER — prestations de loisirs à date déterminée&nbsp;: exceptions applicables.]
        </p>
      </div>
    </main>
  );
}

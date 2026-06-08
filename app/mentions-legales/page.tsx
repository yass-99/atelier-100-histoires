import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Mentions légales — Atelier aux 100 histoires" };

export default function MentionsLegales() {
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
        <h1 className="font-display text-2xl">Mentions légales</h1>
        <p className="text-muted">[À COMPLÉTER avec les informations de l’organisateur.]</p>
        <h2 className="font-display text-lg">Éditeur</h2>
        <p className="text-foreground/90">
          Raison sociale&nbsp;: [À COMPLÉTER]<br />
          Statut&nbsp;: [auto-entrepreneur / association / société]<br />
          SIRET&nbsp;: [À COMPLÉTER]<br />
          Email&nbsp;: [À COMPLÉTER]
        </p>
        <h2 className="font-display text-lg">Hébergement</h2>
        <p className="text-foreground/90">
          Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.
        </p>
        <h2 className="font-display text-lg">Base de données &amp; services</h2>
        <p className="text-foreground/90">
          Supabase (base de données), Stripe (paiement), Clerk (comptes), Resend (emails).
        </p>
      </div>
    </main>
  );
}

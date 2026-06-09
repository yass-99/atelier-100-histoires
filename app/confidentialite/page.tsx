import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Confidentialité — Atelier aux 100 histoires" };

export default function Confidentialite() {
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
        <h1 className="font-display text-2xl">Politique de confidentialité</h1>
        <p className="text-muted">[À COMPLÉTER — gabarit RGPD indicatif.]</p>
        <h2 className="font-display text-lg">Données collectées</h2>
        <p className="text-foreground/90">
          Nom et email lors d’une réservation&nbsp;; données de paiement traitées par Stripe (non stockées par nos soins)&nbsp;;
          email lorsque vous acceptez de recevoir nos actualités et offres (réduction mystère, newsletter).
        </p>
        <h2 className="font-display text-lg">Finalité</h2>
        <p className="text-foreground/90">
          Gestion des réservations et envoi des confirmations. Avec votre consentement explicite&nbsp;:
          envoi d’actualités et d’offres par email. Vous pouvez retirer ce consentement à tout moment
          (lien de désinscription ou simple demande par email)&nbsp;; votre adresse est alors supprimée
          de notre liste de diffusion.
        </p>
        <h2 className="font-display text-lg">Sous-traitants</h2>
        <p className="text-foreground/90">Supabase, Stripe, Clerk, Resend, Vercel.</p>
        <h2 className="font-display text-lg">Vos droits</h2>
        <p className="text-foreground/90">
          Accès, rectification, suppression&nbsp;: écrire à [email de contact À COMPLÉTER].
        </p>
      </div>
    </main>
  );
}

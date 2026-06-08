export const metadata = { title: "Confidentialité — Atelier des 100 histoires" };

export default function Confidentialite() {
  return (
    <main className="screen py-8 space-y-3">
      <h1 className="text-3xl">Politique de confidentialité</h1>
      <p className="text-muted">[À COMPLÉTER — gabarit RGPD indicatif.]</p>
      <h2 className="text-xl">Données collectées</h2>
      <p>Nom et email lors d’une réservation ; données de paiement traitées par Stripe (non stockées par nos soins).</p>
      <h2 className="text-xl">Finalité</h2>
      <p>Gestion des réservations et envoi des confirmations.</p>
      <h2 className="text-xl">Sous-traitants</h2>
      <p>Supabase, Stripe, Clerk, Resend, Vercel.</p>
      <h2 className="text-xl">Vos droits</h2>
      <p>Accès, rectification, suppression : écrire à [email de contact À COMPLÉTER].</p>
    </main>
  );
}

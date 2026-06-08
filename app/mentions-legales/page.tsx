export const metadata = { title: "Mentions légales — Atelier des 100 histoires" };

export default function MentionsLegales() {
  return (
    <main className="screen py-8 space-y-3">
      <h1 className="text-3xl">Mentions légales</h1>
      <p className="text-muted">[À COMPLÉTER avec les informations de l’organisateur.]</p>
      <h2 className="text-xl">Éditeur</h2>
      <p>Raison sociale : [À COMPLÉTER]<br />Statut : [auto-entrepreneur / association / société]<br />SIRET : [À COMPLÉTER]<br />Email : [À COMPLÉTER]</p>
      <h2 className="text-xl">Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
      <h2 className="text-xl">Base de données & services</h2>
      <p>Supabase (base de données), Stripe (paiement), Clerk (comptes), Resend (emails).</p>
    </main>
  );
}

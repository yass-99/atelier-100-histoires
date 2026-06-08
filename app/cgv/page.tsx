export const metadata = { title: "CGV — Atelier des 100 histoires" };

export default function Cgv() {
  return (
    <main className="screen py-8 space-y-3">
      <h1 className="text-3xl">Conditions générales de vente</h1>
      <p className="text-muted">[À COMPLÉTER — gabarit indicatif, à faire valider.]</p>
      <h2 className="text-xl">Objet</h2>
      <p>Les présentes CGV régissent la vente de places aux ateliers proposés par l’organisateur.</p>
      <h2 className="text-xl">Prix et paiement</h2>
      <p>Les prix sont indiqués en euros TTC. Le paiement s’effectue en ligne via Stripe.</p>
      <h2 className="text-xl">Annulation et remboursement</h2>
      <p>[À COMPLÉTER — politique d’annulation. En l’absence de remboursement automatique, préciser les modalités.]</p>
      <h2 className="text-xl">Droit de rétractation</h2>
      <p>[À COMPLÉTER — prestations de loisirs à date déterminée : exceptions applicables.]</p>
    </main>
  );
}

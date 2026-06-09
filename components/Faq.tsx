import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "Faut-il être créatif ou avoir déjà pratiqué ?",
    a: "Pas du tout. Chaque atelier est guidé pas à pas, du choix des matériaux aux finitions. Débutant·e ou habitué·e, tu repars avec une création dont tu es fier·e.",
  },
  {
    q: "Le matériel est-il fourni ?",
    a: "Oui, tout est compris dans le prix : matériaux, outils, et selon les ateliers les huiles, parfums ou matières à choisir sur place.",
  },
  {
    q: "À partir de quel âge pour les enfants ?",
    a: "Chaque atelier indique son public : adultes, enfants (avec âge minimum) ou tous publics à vivre en famille. L'info est sur la fiche de chaque atelier.",
  },
  {
    q: "La consommation sur place est-elle comprise ?",
    a: "Certains ateliers se déroulent en boulangerie ou restaurant et incluent une consommation dans le prix. C'est précisé sur la fiche de l'atelier.",
  },
  {
    q: "Où ont lieu les ateliers ?",
    a: "Dans des lieux variés et chaleureux — boulangeries, restaurants, ateliers… L'adresse exacte est indiquée sur chaque atelier.",
  },
  {
    q: "Puis-je annuler ma réservation ?",
    a: "Oui, contacte-nous au moins 48 h avant la séance pour être remboursé·e ou reporté·e sur une autre date.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le paiement est 100 % sécurisé via Stripe, directement en ligne au moment de la réservation.",
  },
];

export function Faq() {
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">Questions fréquentes</h2>
      <div className="space-y-3">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary>
              {q}
              <ChevronDown className="faq-chevron" aria-hidden />
            </summary>
            <p className="px-5 pb-5 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

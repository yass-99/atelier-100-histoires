import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "Faut-il un niveau en écriture ?",
    a: "Non, aucun prérequis. Les ateliers sont pensés pour tous les niveaux, du grand débutant à l'habitué de la plume.",
  },
  {
    q: "Où ont lieu les ateliers ?",
    a: "Le lieu exact est indiqué sur chaque atelier (ville et adresse). Certaines séances peuvent être en ligne.",
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

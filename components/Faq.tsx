"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { EASE, DURATION } from "@/lib/motion";

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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer select-none items-center justify-between gap-3 px-5 py-4 text-left font-display text-base font-extrabold"
      >
        {q}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          className="shrink-0 text-muted"
          aria-hidden
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">Questions fréquentes</h2>
      <div className="space-y-3">
        {FAQ.map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </div>
    </section>
  );
}

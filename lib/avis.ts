/**
 * Avis clients — SOURCE UNIQUE (démo, à remplacer par de vrais avis).
 * Utilisée par le carrousel de l'accueil (`CommentCaMarche`) et la page `/avis`.
 * Pas de badge « vérifié » tant que l'avis n'est pas authentifié (trompeur + risque légal).
 */
export type Avis = {
  rating: number; // 1 à 5
  quote: string;
  name: string;
  meta: string; // « Atelier … · Lieu … »
  initial: string; // lettre de l'avatar
  avatarTone: string; // classes Tailwind (aplat doux + texte)
};

export const AVIS: Avis[] = [
  {
    rating: 5,
    quote:
      "J'avais peur de ne pas y arriver… je suis repartie avec un bijou que je porte tous les jours. Tout était fourni, l'ambiance au top.",
    name: "Sarah M.",
    meta: "Atelier bijou en argile · Boulangerie Le Fournil",
    initial: "S",
    avatarTone: "bg-magenta-soft text-ink",
  },
  {
    rating: 5,
    quote:
      "Sortie parfaite avec les enfants : tout est prêt, on a juste à profiter et créer. On a déjà réservé la prochaine date !",
    name: "Karim B.",
    meta: "Atelier bougie en famille · Café des Arts",
    initial: "K",
    avatarTone: "bg-brand-soft text-ink",
  },
  {
    rating: 5,
    quote:
      "Ambiance chaleureuse, on est vraiment accompagné·e. On repart fier de sa pièce — bien plus qu'un simple cours.",
    name: "Manon T.",
    meta: "Atelier céramique · Restaurant L'Olivier",
    initial: "M",
    avatarTone: "bg-mint-soft text-ink",
  },
  {
    rating: 5,
    quote:
      "Réservé pour l'anniversaire de ma fille : encadrement génial, chaque enfant est reparti avec sa création. Un super souvenir.",
    name: "Léa P.",
    meta: "Atelier mosaïque enfants · Pâtisserie Léa",
    initial: "L",
    avatarTone: "bg-amber-soft text-ink",
  },
  {
    rating: 5,
    quote:
      "Zéro talent au départ, et pourtant je suis bluffé par ce que j'ai fabriqué. On ne se sent jamais largué, l'animateur prend le temps.",
    name: "Thomas R.",
    meta: "Atelier maroquinerie · Bistrot Lumière",
    initial: "T",
    avatarTone: "bg-lavender text-ink",
  },
  {
    rating: 4,
    quote:
      "Le lieu, l'odeur du pain, le café offert pendant qu'on crée… une vraie parenthèse. Juste un poil trop court à mon goût !",
    name: "Inès D.",
    meta: "Atelier bijou laiton · Boulangerie Le Fournil",
    initial: "I",
    avatarTone: "bg-brand-soft text-ink",
  },
];

/** Agrégat affiché (DÉMO — à remplacer par de vrais chiffres). */
export const AVIS_AGGREGAT = { note: 4.9, total: 87 };

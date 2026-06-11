/**
 * Slides « message » du carrousel hero (non-ateliers). Définies en dur ici :
 * pas de base de données ni d'écran admin. Une slide d'intro (hook expérience)
 * ouvre le carrousel, une slide de clôture (objet + rareté) le ferme. Entre les
 * deux : les ateliers à la une. La zone n'est donc jamais vide.
 *
 * Hiérarchie issue de l'analyse CRO : on vend le désir d'expérience + la rareté,
 * jamais de fausse preuve sociale ni le prix (réservé aux cartes/fiches).
 */
export type HeroMessage = {
  id: string;
  eyebrow: string;
  titre: string;
  texte: string;
  ctaLabel: string;
  ctaHref: string;
  /** Classe de ton (aplat de marque) — voir `.tone-*` dans globals.css. */
  tone: string;
};

/** Ancre de la liste des ateliers (cible des CTA « Voir les ateliers »). */
export const SESSIONS_ANCHOR = "ateliers";

/** Slide d'ouverture : le hook « sortie créative » (le plus convertissant). */
export const heroIntro: HeroMessage = {
  id: "intro",
  eyebrow: "Sortie créative",
  titre: "Et si ta prochaine sortie était à créer ?",
  texte:
    "Un atelier DIY dans un café près de chez toi — repars avec ta création, à deux, en famille ou entre amis.",
  ctaLabel: "Voir les ateliers",
  ctaHref: `#${SESSIONS_ANCHOR}`,
  tone: "tone-brand",
};

/** Slide de clôture : l'objet à emporter + la rareté réelle. */
export const heroOutro: HeroMessage = {
  id: "outro",
  eyebrow: "Fait main",
  titre: "Repars avec ta création",
  texte:
    "Bijou, mosaïque, peinture ou textile — tout est fourni, aucun niveau requis, et les places partent vite.",
  ctaLabel: "Voir les ateliers",
  ctaHref: `#${SESSIONS_ANCHOR}`,
  tone: "tone-magenta",
};

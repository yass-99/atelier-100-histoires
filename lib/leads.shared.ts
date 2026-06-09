/** Fonctions pures sur les leads « réduction mystère » — client et serveur. */

/** Remises mystère possibles (en %). */
export type MysteryDiscount = 5 | 10 | 15;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Tirage pondéré : −5 % (50 %), −10 % (40 %), −15 % (10 %). */
export function drawDiscount(rand: () => number = Math.random): MysteryDiscount {
  const r = rand();
  if (r < 0.5) return 5;
  if (r < 0.9) return 10;
  return 15;
}

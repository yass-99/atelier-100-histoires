import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Garantit l'existence du coupon Stripe `mystere_<pct>` (création paresseuse). */
export async function ensureMysteryCoupon(pct: number): Promise<string> {
  const id = `mystere_${pct}`;
  try {
    await stripe.coupons.retrieve(id);
    return id;
  } catch (err) {
    if ((err as { code?: string }).code !== "resource_missing") throw err;
  }
  try {
    await stripe.coupons.create({
      id,
      percent_off: pct,
      duration: "once",
      name: `Réduction mystère -${pct}%`,
    });
  } catch (err) {
    // Course : déjà créé entre-temps — OK.
    if ((err as { code?: string }).code !== "resource_already_exists") throw err;
  }
  return id;
}

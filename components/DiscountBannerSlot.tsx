import { getMyDiscount } from "@/lib/leads";
import { DiscountBanner } from "./DiscountBanner";

/**
 * Récupère la remise du compte (donnée runtime/auth) HORS du chemin bloquant du
 * layout : enveloppé dans un `<Suspense>`, il laisse le shell se rendre tout de
 * suite — sinon l'`await` du layout bloquerait l'affichage de `loading.tsx`
 * (cf. docs Next « loading.js » + layout runtime data).
 */
export async function DiscountBannerSlot() {
  const pct = await getMyDiscount();
  return <DiscountBanner pct={pct} />;
}

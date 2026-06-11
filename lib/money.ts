export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}

/** Prix après remise (en cents). Même formule que le serveur (checkout). */
export function discountedCents(cents: number, pct: number): number {
  return Math.round((cents * (100 - pct)) / 100);
}

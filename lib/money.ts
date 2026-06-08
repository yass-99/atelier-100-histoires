export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}

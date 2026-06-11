"use client";
import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Émet l'événement `purchase_completed` (Vercel Analytics) une seule fois par
 * réservation : la page /merci est publique et peut être rouverte (lien email,
 * back…). Un garde localStorage évite de gonfler le taux de conversion.
 */
export function TrackPurchase({
  id,
  valueEur,
  places,
  sessionId,
}: {
  id: string;
  valueEur: number;
  places: number;
  sessionId: string;
}) {
  useEffect(() => {
    const key = `purchase_tracked_${id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    track("purchase_completed", {
      booking_id: id,
      value: valueEur,
      places,
      session_id: sessionId,
    });
  }, [id, valueEur, places, sessionId]);
  return null;
}

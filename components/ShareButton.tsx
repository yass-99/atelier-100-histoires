"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { CircleButton } from "./CircleButton";

export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* partage annulé par l'utilisateur — rien à faire */
    }
  }
  return (
    <CircleButton as="button" label="Partager le lien" onClick={share}>
      {done ? <Check className="h-5 w-5" strokeWidth={2} /> : <Share2 className="h-5 w-5" strokeWidth={2} />}
    </CircleButton>
  );
}

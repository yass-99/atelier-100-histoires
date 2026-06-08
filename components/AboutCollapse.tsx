"use client";
import { useState } from "react";

export function AboutCollapse({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div>
      <p className={`mt-2 whitespace-pre-line leading-relaxed text-foreground/90 ${!open && long ? "line-clamp-4" : ""}`}>
        {text}
      </p>
      {long && (
        <button onClick={() => setOpen((v) => !v)} className="mt-2 text-sm font-bold text-brand-ink" aria-expanded={open}>
          {open ? "Lire moins" : "Lire plus"}
        </button>
      )}
    </div>
  );
}

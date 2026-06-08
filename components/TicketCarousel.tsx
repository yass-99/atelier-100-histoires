"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, Session } from "@/lib/types";
import { Ticket } from "./Ticket";

/**
 * Carousel de billets : un ticket scannable (QR distinct) par place réservée.
 * Défilement tactile avec accroche (scroll-snap) + indicateurs de page.
 * Un seul billet → pas de carousel.
 */
export function TicketCarousel({
  b,
  s,
  qrs,
}: {
  b: Booking;
  s: Session;
  qrs: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (qrs.length <= 1) {
    return <Ticket b={b} s={s} qr={qrs[0]} />;
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const stride = el.clientWidth + 16; // largeur d'un billet + gap-4
    setActive(Math.round(el.scrollLeft / stride));
  }

  function goTo(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(qrs.length - 1, i));
    el.scrollTo({ left: clamped * (el.clientWidth + 16), behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${qrs.length} billets, fais glisser pour les voir`}
      >
        {qrs.map((qr, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            <Ticket b={b} s={s} qr={qr} seat={{ index: i + 1, total: qrs.length }} />
          </div>
        ))}
      </div>

      {/* Flèches + indicateurs */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Billet précédent"
          className="circle-btn h-10 w-10 disabled:opacity-30 disabled:active:scale-100"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>

        <div className="flex items-center gap-2" aria-hidden>
          {qrs.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-5 bg-ink" : "w-2 bg-ink/25"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === qrs.length - 1}
          aria-label="Billet suivant"
          className="circle-btn h-10 w-10 disabled:opacity-30 disabled:active:scale-100"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

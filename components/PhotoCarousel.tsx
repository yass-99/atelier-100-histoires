"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Carrousel d'images plein-cadre (hero). Le parent fixe la hauteur. */
export function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const c = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: c * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${images.length} photo${images.length > 1 ? "s" : ""}, fais glisser`}
      >
        {images.map((src, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} — photo ${i + 1}`}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Photo précédente"
            className="circle-btn absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === images.length - 1}
            aria-label="Photo suivante"
            className="circle-btn absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
          </button>

          <div className="absolute inset-x-0 bottom-10 flex justify-center gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

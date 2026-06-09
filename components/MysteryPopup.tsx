"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Loader2, PartyPopper, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = "mystery_popup_v1";
const DELAY_MS = 8000;
const SCROLL_RATIO = 0.3;

/**
 * Pop-up « réduction mystère » : capture d'email avec consentement marketing
 * explicite (RGPD), tirage révélé immédiatement. Affichée une seule fois par
 * visiteur (localStorage), après 8 s ou 30 % de scroll — le premier des deux.
 */
export function MysteryPopup() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const triggered = useRef(false);

  // Déclenchement : 8 s ou 30 % de scroll, une seule fois par visiteur.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    function show() {
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    }
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_RATIO) show();
    }

    const timer = setTimeout(show, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Fermeture à la touche Échap.
  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, pct ? "claimed" : "dismissed");
    setVisible(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const data = await res.json();
      if (typeof data.pct === "number") {
        setPct(data.pct);
        localStorage.setItem(STORAGE_KEY, "claimed");
      } else {
        setError(data.error ?? "Une erreur est survenue. Réessaie.");
      }
    } catch {
      setError("Problème de connexion. Vérifie ta connexion et réessaie.");
    }
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={dismiss}
        >
          <motion.div
            key="card"
            role="dialog"
            aria-modal="true"
            aria-label="Réduction mystère"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-md rounded-card border-[1.5px] border-ink bg-surface p-6 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background text-ink transition active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            {pct === null ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-soft text-ink">
                  <Gift className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-2xl leading-tight">
                  Une réduction mystère t&apos;attend 🎁
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Laisse ton email et découvre ta remise (jusqu&apos;à −15 %) sur ton
                  prochain atelier.
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-3">
                  <div>
                    <label className="field-label" htmlFor="mystery-email">Email</label>
                    <input
                      id="mystery-email"
                      name="email"
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      placeholder="ton@email.fr"
                      className="field"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                    />
                    <span>
                      J&apos;accepte de recevoir par email les actualités et offres de
                      l&apos;Atelier aux 100 histoires. Désinscription possible à tout
                      moment —{" "}
                      <Link href="/confidentialite" className="underline">
                        politique de confidentialité
                      </Link>
                      .
                    </span>
                  </label>

                  {error && (
                    <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                      {error}
                    </p>
                  )}

                  <button className="btn-primary w-full" disabled={loading || !consent}>
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Tirage en cours…</>
                    ) : (
                      <><Gift className="h-5 w-5" /> Découvrir ma remise</>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber text-ink">
                  <PartyPopper className="h-7 w-7" strokeWidth={2} aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-3xl leading-tight">
                  −{pct} % sur ton prochain atelier !
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Ta remise sera appliquée automatiquement quand tu réserveras avec
                  cet email.
                </p>
                <button type="button" onClick={dismiss} className="btn-primary mt-5 w-full">
                  C&apos;est noté !
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

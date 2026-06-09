"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
 * Si le visiteur la referme sans jouer, un bouton cadeau animé reste collé en
 * bas à droite pour lui laisser une seconde chance.
 */
export function MysteryPopup() {
  const [visible, setVisible] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const triggered = useRef(false);
  // Connecté → email pré-rempli (une friction en moins).
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  // Déclenchement : 8 s ou 30 % de scroll, une seule fois par visiteur.
  // Déjà refusée → seulement le bouton cadeau. Déjà gagnée → plus rien.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "claimed") return;
    if (saved === "dismissed") {
      // Apparition différée : évite le flash à l'hydratation et la règle
      // react-hooks/set-state-in-effect (pas de setState synchrone en effet).
      const t = setTimeout(() => setBubble(true), 600);
      return () => clearTimeout(t);
    }

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
    if (pct) {
      localStorage.setItem(STORAGE_KEY, "claimed");
      setVisible(false);
      return;
    }
    // Refus : on garde une porte d'entrée discrète mais visible.
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
    setBubble(true);
  }

  function reopen() {
    setBubble(false);
    setVisible(true);
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
      {bubble && !visible && (
        <motion.button
          key="bubble"
          type="button"
          onClick={reopen}
          aria-label="Découvrir ma réduction mystère"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-ink bg-amber text-ink shadow-lift transition active:scale-95"
        >
          {/* Secousse périodique pour attirer l'œil sans épuiser */}
          <motion.span
            animate={{ rotate: [0, -16, 14, -10, 8, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            className="flex"
          >
            <Gift className="h-6 w-6" strokeWidth={2} aria-hidden />
          </motion.span>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border border-ink bg-danger" />
          </span>
        </motion.button>
      )}

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
                  Psst… on a un cadeau pour toi 🎁
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Ton email contre une remise mystère. Tu joues&nbsp;?
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-3">
                  <input
                    key={userEmail || "anon"}
                    id="mystery-email"
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    placeholder="ton@email.fr"
                    defaultValue={userEmail}
                    aria-label="Email"
                    className="field"
                  />

                  <label className="flex items-start gap-2.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                    />
                    <span>
                      OK pour recevoir vos offres par email. Désinscription à tout
                      moment —{" "}
                      <Link href="/confidentialite" className="underline">
                        confidentialité
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
                      <><Loader2 className="h-5 w-5 animate-spin" /> Tirage…</>
                    ) : (
                      <><Gift className="h-5 w-5" /> Je découvre</>
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
                  −{pct} % pour toi !
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Appliqué automatiquement quand tu réserves avec cet email.
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

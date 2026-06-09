"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { track } from "@vercel/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Loader2, PartyPopper, Sparkles, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = "mystery_popup_v1";
const DELAY_MS = 8000;
const SCROLL_RATIO = 0.3;

type Step = "teaser" | "form" | "done";

/**
 * Pop-up « réduction mystère » en deux temps : un teaser intrigant
 * (« ça t'intéresse ? ») qui débouche sur le champ email + consentement
 * RGPD, puis la révélation du tirage. Connecté → email pré-rempli.
 * Refusée → bouton cadeau animé en bas à droite (seconde chance).
 * Chaque étape émet un événement Vercel Analytics pour mesurer la
 * conversion : vue → intéressé → email.
 */
export function MysteryPopup() {
  const [visible, setVisible] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [step, setStep] = useState<Step>("teaser");
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
      track("mystery_vue");
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
  }, [visible, step, pct]);

  function dismiss() {
    if (pct) {
      localStorage.setItem(STORAGE_KEY, "claimed");
      setVisible(false);
      return;
    }
    // Refus : on garde une porte d'entrée discrète mais visible.
    track("mystery_refus", { etape: step });
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
    setBubble(true);
  }

  function reopen() {
    track("mystery_bulle_clic");
    setBubble(false);
    setVisible(true);
  }

  function onInterested() {
    track("mystery_interesse");
    setStep("form");
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
        setStep("done");
        localStorage.setItem(STORAGE_KEY, "claimed");
        track("mystery_conversion", { pct: data.pct });
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onClick={dismiss}
        >
          <motion.div
            key="card"
            role="dialog"
            aria-modal="true"
            aria-label="Réduction mystère"
            initial={{ y: 60, opacity: 0, rotate: -1.5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-md overflow-hidden rounded-card border-[1.5px] border-ink bg-brand p-6 text-white shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Décor : grand cadeau fantôme en fond */}
            <Gift
              className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 text-white/10"
              strokeWidth={1.2}
              aria-hidden
            />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            {step === "teaser" && (
              <>
                <motion.span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber text-ink shadow-pop"
                  animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
                >
                  <Gift className="h-7 w-7" strokeWidth={2} aria-hidden />
                </motion.span>
                <p className="eyebrow mt-4 text-amber">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  Surprise
                </p>
                <h2 className="mt-1 font-display text-[28px] leading-[1.08]">
                  On a caché un cadeau sur cette page.
                </h2>
                <p className="mt-2 text-base text-white/85">Ça t&apos;intéresse&nbsp;?</p>
                <div className="mt-5 space-y-2">
                  <button type="button" onClick={onInterested} className="btn-amber w-full">
                    Oui, montre-moi 👀
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="w-full py-2 text-center text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    Non merci
                  </button>
                </div>
              </>
            )}

            {step === "form" && (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber text-ink shadow-pop">
                  <Gift className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-2xl leading-tight">
                  Bien vu. Ton email, et il est à toi.
                </h2>

                <form onSubmit={onSubmit} className="mt-4 space-y-3">
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
                    className="field border-white/30 bg-white text-ink"
                  />

                  <label className="flex items-start gap-2.5 text-xs text-white/75">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-amber"
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
                    <p role="alert" className="rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white">
                      {error}
                    </p>
                  )}

                  <button className="btn-amber w-full" disabled={loading || !consent}>
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Ouverture…</>
                    ) : (
                      <><Gift className="h-5 w-5" /> Ouvrir mon cadeau</>
                    )}
                  </button>
                </form>
              </>
            )}

            {step === "done" && pct !== null && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="text-center"
              >
                <motion.span
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber text-ink shadow-pop"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                >
                  <PartyPopper className="h-8 w-8" strokeWidth={2} aria-hidden />
                </motion.span>
                <h2 className="mt-4 font-display text-4xl leading-tight">
                  −{pct}&nbsp;% pour toi !
                </h2>
                <p className="mt-2 text-sm text-white/85">
                  Appliqué automatiquement quand tu réserves avec cet email.
                </p>
                <button type="button" onClick={dismiss} className="btn-amber mt-5 w-full">
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

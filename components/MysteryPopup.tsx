"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { track } from "@vercel/analytics";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Gift, Loader2, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = "mystery_popup_v1";
const DELAY_MS = 8000;
const SCROLL_RATIO = 0.3;

type Step = "teaser" | "form" | "done";

/** Mots du titre teaser, révélés un à un. */
const TITLE_WORDS = ["On", "a", "caché", "quelque", "chose", "sur", "cette", "page."];

const wordsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};
const word = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: EASE } },
};

/** Pseudo-aléatoire déterministe (pur, exigé par les règles React) ∈ [0, 1). */
function prand(seed: number): number {
  const x = Math.sin(seed * 999.91) * 10000;
  return x - Math.floor(x);
}

/** Explosion de confettis (couleurs de la palette maison). */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        angle: ((i / 26) * 360 + prand(i + 1) * 24) * (Math.PI / 180),
        dist: 90 + prand(i + 31) * 110,
        size: 5 + prand(i + 61) * 6,
        color: ["#f4b63c", "#ffffff", "#e0566f", "#d8efe0"][i % 4],
        delay: prand(i + 91) * 0.12,
        rot: prand(i + 121) * 540 - 270,
      })),
    [],
  );
  return (
    <span className="pointer-events-none absolute left-1/2 top-16" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist + 40,
            opacity: 0,
            rotate: p.rot,
            scale: 0.6,
          }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

/**
 * Pop-up « réduction mystère » en deux temps : un teaser intrigant
 * (« ça t'intéresse ? ») qui débouche sur le champ email + consentement
 * RGPD, puis la révélation du tirage (compteur + confettis). Connecté →
 * email pré-rempli. Refusée → bouton cadeau animé en bas à droite.
 * Chaque étape émet un événement Vercel Analytics (funnel de conversion).
 */
export function MysteryPopup() {
  const [visible, setVisible] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [step, setStep] = useState<Step>("teaser");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [shownPct, setShownPct] = useState(0);
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

  // Révélation : le pourcentage grimpe de 0 à sa valeur.
  useEffect(() => {
    if (step !== "done" || pct === null) return;
    const controls = animate(0, pct, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setShownPct(Math.round(v)),
    });
    return () => controls.stop();
  }, [step, pct]);

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={dismiss}
        >
          <motion.div
            key="card"
            role="dialog"
            aria-modal="true"
            aria-label="Réduction mystère"
            initial={{ y: 90, scale: 0.92, rotate: -2, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            exit={{ y: 70, scale: 0.95, opacity: 0, transition: { duration: 0.22 } }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-card border-[1.5px] border-ink bg-brand p-6 text-white shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Halos lumineux animés (décor, pas d'icône) */}
            <motion.span
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber/25 blur-3xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <motion.span
              className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-magenta/25 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {step === "teaser" && (
                <motion.div
                  key="teaser"
                  exit={{ opacity: 0, x: -28, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <motion.p
                    className="eyebrow text-amber"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    ✦ Surprise
                  </motion.p>
                  <motion.h2
                    className="mt-2 font-display text-[32px] leading-[1.08]"
                    variants={wordsContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {TITLE_WORDS.map((w, i) => (
                      <motion.span key={i} variants={word} className="inline-block">
                        {w}
                        {i < TITLE_WORDS.length - 1 ? " " : ""}
                      </motion.span>
                    ))}
                  </motion.h2>
                  <motion.p
                    className="mt-3 text-lg font-semibold text-white/90"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.4, ease: EASE }}
                  >
                    Ça t&apos;intéresse&nbsp;?
                  </motion.p>
                  <motion.div
                    className="mt-5 space-y-2"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.35, duration: 0.4, ease: EASE }}
                  >
                    <motion.button
                      type="button"
                      onClick={onInterested}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-amber relative w-full overflow-hidden"
                    >
                      {/* Reflet qui balaie le bouton */}
                      <motion.span
                        className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/40"
                        initial={{ left: "-25%" }}
                        animate={{ left: "120%" }}
                        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
                        aria-hidden
                      />
                      Oui, montre-moi
                    </motion.button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="w-full py-2 text-center text-sm font-semibold text-white/60 transition hover:text-white"
                    >
                      Non merci
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 28, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -28, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <p className="eyebrow text-amber">✦ Tu y es presque</p>
                  <h2 className="mt-2 font-display text-2xl leading-tight">
                    Ton email, et c&apos;est à toi.
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

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-amber w-full"
                      disabled={loading || !consent}
                    >
                      {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Ouverture…</>
                      ) : (
                        "Découvrir ma surprise"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {step === "done" && pct !== null && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="relative text-center"
                >
                  <Confetti />
                  <p className="eyebrow text-amber">✦ Bien joué</p>
                  <motion.h2
                    className="mt-3 font-display text-[64px] leading-none tracking-tight"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.1 }}
                  >
                    −{shownPct}&nbsp;%
                  </motion.h2>
                  <motion.p
                    className="mx-auto mt-3 max-w-xs text-sm text-white/85"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
                  >
                    Pour toi, sur ton prochain atelier. Appliqué automatiquement quand
                    tu réserves avec cet email.
                  </motion.p>
                  <motion.button
                    type="button"
                    onClick={dismiss}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4, ease: EASE }}
                    className="btn-amber mt-5 w-full"
                  >
                    C&apos;est noté !
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

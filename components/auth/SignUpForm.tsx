"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

type ClerkErr = { message?: string; longMessage?: string } | null | undefined;
const msg = (e: ClerkErr, fallback: string) => e?.longMessage ?? e?.message ?? fallback;

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const prefillEmail = useSearchParams().get("email") ?? "";
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoaded = fetchStatus !== undefined;

  async function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError(null);
    const mail = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const { error: e1 } = await signUp.create({ emailAddress: mail });
    if (e1) {
      setError(msg(e1, "Inscription impossible avec cet email."));
      setLoading(false);
      return;
    }
    const { error: e2 } = await signUp.verifications.sendEmailCode();
    if (e2) {
      setError(msg(e2, "Impossible d'envoyer le code. Réessaie."));
      setLoading(false);
      return;
    }
    setEmail(mail);
    setStep("code");
    setLoading(false);
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError(null);
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    const { error: e1 } = await signUp.verifications.verifyEmailCode({ code });
    if (e1) {
      setError(msg(e1, "Code invalide ou expiré."));
      setLoading(false);
      return;
    }
    if (signUp.status === "complete") {
      const { error: e2 } = await signUp.finalize();
      if (e2) {
        setError(msg(e2, "Erreur lors de la création du compte."));
        setLoading(false);
        return;
      }
      router.push("/");
    } else {
      setError("Inscription incomplète. Réessaie.");
      setLoading(false);
    }
  }

  async function resend() {
    if (!signUp) return;
    setError(null);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setError(msg(error, "Impossible de renvoyer le code."));
  }

  if (step === "code") {
    return (
      <form onSubmit={onVerify} className="card space-y-4">
        <p className="text-sm text-muted">
          Code envoyé à <span className="font-bold text-foreground">{email}</span>.
        </p>
        <div>
          <label className="field-label" htmlFor="code">Code de confirmation</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            placeholder="123456"
            className="field text-center text-2xl font-bold tracking-[0.4em]"
            autoFocus
          />
        </div>
        {error && (
          <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
        )}
        <button className="btn-primary h-14 w-full" disabled={loading || !isLoaded}>
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Création…</> : <>Créer mon compte <ArrowRight className="h-5 w-5" /></>}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setStep("email"); setError(null); }} className="inline-flex items-center gap-1 font-bold text-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Changer d&apos;email
          </button>
          <button type="button" onClick={resend} className="font-bold text-brand-ink">Renvoyer le code</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSendCode} className="card space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={prefillEmail} placeholder="ton@email.fr" className="field" autoFocus />
      </div>
      {/* Cible du widget anti-bot Clerk (Smart CAPTCHA) si l'instance l'exige */}
      <div id="clerk-captcha" />
      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
      )}
      <button className="btn-primary h-14 w-full" disabled={loading || !isLoaded}>
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi…</> : <>Recevoir mon code <ArrowRight className="h-5 w-5" /></>}
      </button>
    </form>
  );
}

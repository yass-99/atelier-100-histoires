"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const prefillEmail = useSearchParams().get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = fetchStatus !== undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const emailAddress = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      // Clerk 7 Signal API: signUp.password() creates account with email + password
      const { error: signUpError } = await signUp.password({
        emailAddress,
        password,
      });
      if (signUpError) {
        setError(signUpError.longMessage ?? signUpError.message ?? "Inscription impossible.");
        setLoading(false);
        return;
      }
      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(finalizeError.longMessage ?? finalizeError.message ?? "Erreur lors de la création du compte.");
          setLoading(false);
          return;
        }
        router.push("/");
      } else {
        // status is 'missing_requirements' — email verification still required in Clerk dashboard
        setError(
          "Inscription incomplète : vérifie la configuration (vérification email à désactiver dans Clerk).",
        );
        setLoading(false);
      }
    } catch (err: unknown) {
      const e2 = err as { errors?: { message?: string; longMessage?: string }[] };
      setError(e2?.errors?.[0]?.longMessage ?? e2?.errors?.[0]?.message ?? "Inscription impossible.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefillEmail}
          className="field"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="field"
        />
      </div>
      {/* Cible du widget anti-bot Clerk (Smart CAPTCHA) si l'instance l'exige */}
      <div id="clerk-captcha" />
      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <button className="btn-primary h-14 w-full" disabled={loading || !isLoaded}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Création…
          </>
        ) : (
          "Créer mon compte"
        )}
      </button>
    </form>
  );
}

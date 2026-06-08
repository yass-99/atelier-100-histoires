"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = fetchStatus !== undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      // Clerk 7 Signal API: signIn.password() handles identifier + password in one call
      const { error: signInError } = await signIn.password({
        identifier: email,
        password,
      });
      if (signInError) {
        setError(signInError.longMessage ?? signInError.message ?? "Identifiants invalides.");
        setLoading(false);
        return;
      }
      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.longMessage ?? finalizeError.message ?? "Erreur lors de la connexion.");
          setLoading(false);
          return;
        }
        router.push("/");
      } else {
        setError("Connexion incomplète. Réessaie.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(messageFromClerk(err));
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
          autoComplete="current-password"
          className="field"
        />
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <button className="btn-primary h-14 w-full" disabled={loading || !isLoaded}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Connexion…
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}

function messageFromClerk(err: unknown): string {
  const e = err as { errors?: { message?: string; longMessage?: string }[] };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? "Identifiants invalides.";
}

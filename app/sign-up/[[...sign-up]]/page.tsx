import Link from "next/link";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Créer un compte — Atelier des 100 histoires" };

export default function SignUpPage() {
  return (
    <main className="screen py-12">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-on-ink">
          <Sparkles className="h-7 w-7" strokeWidth={2.4} />
        </span>
        <h1 className="mt-4 font-display text-3xl">Rejoins l&apos;atelier</h1>
        <p className="mt-2 text-muted">Crée ton compte en un instant.</p>
      </div>
      <Reveal className="mt-8">
        <Suspense fallback={<div className="card h-64 animate-pulse" />}>
          <SignUpForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="font-bold text-brand-ink">
            Se connecter
          </Link>
        </p>
      </Reveal>
    </main>
  );
}

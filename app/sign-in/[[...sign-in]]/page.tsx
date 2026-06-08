import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Connexion — Atelier des 100 histoires" };

export default function SignInPage() {
  return (
    <main className="screen py-12">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-on-ink">
          <Sparkles className="h-7 w-7" strokeWidth={2.4} />
        </span>
        <h1 className="mt-4 font-display text-3xl">Content de te revoir</h1>
        <p className="mt-2 text-muted">Connecte-toi avec ton email.</p>
      </div>
      <Reveal className="mt-8">
        <SignInForm />
        <p className="mt-4 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/sign-up" className="font-bold text-brand-ink">
            Créer un compte
          </Link>
        </p>
      </Reveal>
    </main>
  );
}

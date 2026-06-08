import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Créer un compte — Atelier des 100 histoires" };

export default function SignUpPage() {
  return (
    <main className="screen py-10">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-magenta text-white shadow-lift">
            <Sparkles className="h-7 w-7" strokeWidth={2.4} />
          </span>
          <h1 className="mt-4 font-display text-3xl">Rejoins l&apos;atelier</h1>
          <p className="mt-2 text-muted">
            Crée ton compte en un instant&nbsp;: juste ton email suffit.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mt-6">
        <div className="card flex justify-center">
          <SignUp
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
          />
        </div>
      </Reveal>
    </main>
  );
}

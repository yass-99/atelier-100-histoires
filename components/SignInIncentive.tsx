import Link from "next/link";
import { UserPlus, BellRing } from "lucide-react";

export function SignInIncentive({ signedIn, email }: { signedIn: boolean; email: string }) {
  if (signedIn) {
    return (
      <div className="card mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><BellRing className="h-5 w-5" /></span>
        <p className="text-sm font-medium">Tu retrouveras ce billet dans ton espace, et tu seras informé·e des prochains ateliers.</p>
      </div>
    );
  }
  return (
    <div className="card mt-5 tone-lime">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink"><UserPlus className="h-5 w-5" /></span>
        <div>
          <p className="font-display text-lg">Garde tes billets à portée</p>
          <p className="mt-1 text-sm text-ink/80">Crée ton compte pour retrouver tes billets et être informé·e des prochains ateliers.</p>
        </div>
      </div>
      <Link href={`/sign-up?email=${encodeURIComponent(email)}`} className="btn-primary mt-4 w-full">Créer mon compte</Link>
    </div>
  );
}

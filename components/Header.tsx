import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { clerkAppearance } from "./clerk-appearance";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="screen flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-on-ink">
            <Sparkles className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="truncate font-display text-base font-extrabold leading-tight">
            Atelier des 100 histoires
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-out">
            <Link href="/sign-in" className="btn-primary min-h-0 px-4 py-2 text-sm">
              Connexion
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={clerkAppearance} />
          </Show>
        </div>
      </div>
    </header>
  );
}

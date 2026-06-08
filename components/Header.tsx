import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="screen flex h-14 items-center justify-between">
        <Link href="/" className="truncate font-display text-base font-extrabold sm:text-lg">
          Atelier des 100 histoires
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <button className="btn-ghost min-h-0 px-3 py-1.5 text-sm">Connexion</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}

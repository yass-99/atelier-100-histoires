"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Ticket } from "lucide-react";
import { LogoLink } from "./Logo";
import { clerkAppearance } from "./clerk-appearance";

export function Header() {
  const pathname = usePathname();
  // Pages atelier (info) et réservation (paiement) : pas de header global,
  // la navigation se fait via back/partage flottants.
  if (pathname?.startsWith("/ateliers/")) return null;

  return (
    <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-background">
      <div className="screen flex h-16 items-center justify-between">
        <LogoLink className="text-2xl" />

        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-out">
            <Link href="/sign-in" className="btn-primary min-h-10 px-4 py-2 text-sm">
              Connexion
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={clerkAppearance}>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Mes billets"
                  labelIcon={<Ticket className="h-4 w-4" strokeWidth={2} />}
                  href="/mes-billets"
                />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
        </div>
      </div>
    </header>
  );
}

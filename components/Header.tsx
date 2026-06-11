"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, useAuth } from "@clerk/nextjs";
import { track } from "@vercel/analytics";
import { Ticket, ShieldCheck } from "lucide-react";
import { LogoLink } from "./Logo";
import { clerkAppearance } from "./clerk-appearance";

export function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Statut admin vérifié côté serveur (route /api/me/admin), seulement
  // quand l'utilisateur est connecté. Garde le layout 100 % statique.
  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    fetch("/api/me/admin")
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => active && setIsAdmin(!!d.admin))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isSignedIn]);

  // Pages atelier (info) et réservation (paiement) : pas de header global,
  // la navigation se fait via back/partage flottants.
  if (pathname?.startsWith("/ateliers/")) return null;

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-background"
    >
      <div className="screen flex h-16 items-center justify-between">
        <LogoLink className="text-2xl" />

        <div className="flex shrink-0 items-center gap-3">
          {/* Déconnecté : on garde uniquement « Connexion » (évite 2 boutons
              serrés sur mobile). « Crée ton atelier » réapparaît une fois
              connecté, à côté de l'avatar. */}
          <Show when="signed-out">
            <Link href="/sign-in" className="btn-primary min-h-10 px-4 py-2 text-sm">
              Connexion
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/cree-ton-atelier"
              onClick={() => track("cree_atelier_clic", { from: "header" })}
              className="btn-amber min-h-10 whitespace-nowrap px-4 py-2 text-sm"
            >
              Crée ton atelier
            </Link>
            <UserButton appearance={clerkAppearance}>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Mes billets"
                  labelIcon={<Ticket className="h-4 w-4" strokeWidth={2} />}
                  href="/mes-billets"
                />
                {isSignedIn && isAdmin && (
                  <UserButton.Link
                    label="Admin"
                    labelIcon={<ShieldCheck className="h-4 w-4" strokeWidth={2} />}
                    href="/admin"
                  />
                )}
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

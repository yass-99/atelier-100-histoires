"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ateliers/")) return null;

  return (
    <footer className="mt-12 px-4 pb-8">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-card bg-ink p-7 text-on-ink">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-ink">
            <Sparkles className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="font-display text-lg font-extrabold">
            Atelier des 100 histoires
          </p>
        </div>
        <p className="mt-3 text-sm text-on-ink/70">
          Petites histoires. Grandes rencontres.
        </p>

        <nav className="mt-6 flex flex-col gap-2 text-sm font-semibold">
          <Link href="/mentions-legales" className="text-on-ink/80 hover:text-on-ink">
            Mentions légales
          </Link>
          <Link href="/cgv" className="text-on-ink/80 hover:text-on-ink">
            Conditions générales de vente
          </Link>
          <Link href="/confidentialite" className="text-on-ink/80 hover:text-on-ink">
            Confidentialité
          </Link>
        </nav>

        <p className="mt-6 text-xs text-on-ink/50">
          © {new Date().getFullYear()} Atelier des 100 histoires
        </p>
      </div>
    </footer>
  );
}

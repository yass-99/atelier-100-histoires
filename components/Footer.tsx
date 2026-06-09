"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ateliers/")) return null;

  return (
    <footer className="w-full bg-ink text-on-ink">
      <div className="screen py-12">
        <Logo tone="light" className="text-2xl" />
        <p className="mt-3 text-sm text-on-ink/70">
          Crée de tes mains, repars avec ta création.
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
          © {new Date().getFullYear()} Atelier aux 100 histoires
        </p>
      </div>
    </footer>
  );
}

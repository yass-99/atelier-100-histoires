import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 text-center text-sm text-muted">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/cgv">CGV</Link>
        <Link href="/confidentialite">Confidentialité</Link>
      </nav>
      <p className="mt-2">© Atelier des 100 histoires</p>
    </footer>
  );
}

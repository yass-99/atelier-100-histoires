import Link from "next/link";

type Tone = "dark" | "light";

/**
 * Wordmark « Atelier des 100 histoires » — empilé éditorial.
 * Sur-titre « ATELIER DES » discret, puis ligne forte « 100 histoires »
 * où le « 100 » porte l'accent bleu.
 * La taille se pilote par la font-size du parent (className text-*) :
 * la ligne forte vaut 1em, le sur-titre ~0.42em.
 *
 * tone="dark"  → sur fond clair (header crème)
 * tone="light" → sur fond foncé (footer encre)
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: Tone;
}) {
  const eyebrow = tone === "light" ? "text-on-ink/70" : "text-muted";
  const accent = tone === "light" ? "text-brand" : "text-brand-ink";
  const strong = tone === "light" ? "text-on-ink" : "text-foreground";
  return (
    <span
      className={`inline-flex flex-col font-display leading-none ${className ?? ""}`}
    >
      <span className={`text-[0.42em] font-bold uppercase tracking-[0.16em] ${eyebrow}`}>
        Atelier&nbsp;des
      </span>
      <span className={`mt-[0.14em] font-black tracking-[-0.03em] ${strong}`}>
        <span className={accent}>100</span>&nbsp;histoires
      </span>
    </span>
  );
}

/** Variante cliquable qui renvoie à l'accueil (header). */
export function LogoLink({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <Link href="/" className="min-w-0" aria-label="Atelier des 100 histoires — accueil">
      <Logo tone={tone} className={className} />
    </Link>
  );
}

import { LegalDoc, LegalSection, LegalDefs } from "@/components/LegalDoc";

export const metadata = { title: "Mentions légales — Atelier aux 100 histoires" };

const CONTACT = "atelieraux100histoires@gmail.com";

export default function MentionsLegales() {
  return (
    <LegalDoc
      title="Mentions légales"
      updated="11 juin 2026"
      meta={[{ label: "Éditeur", value: "Imen Mokrani (EI)" }]}
    >
      <LegalSection title="Éditeur du site">
        <p>
          Le présent site est édité par l&apos;exploitante de l&apos;enseigne{" "}
          <strong>L&apos;Atelier aux 100 histoires</strong>.
        </p>
        <LegalDefs
          items={[
            { label: "Exploitante", value: "Imen Mokrani (née Berraies)" },
            { label: "Forme juridique", value: "Entrepreneur individuel (EI)" },
            { label: "SIREN", value: "888 299 559" },
            { label: "SIRET (siège)", value: "888 299 559 00011" },
            { label: "RCS", value: "Evry 888 299 559" },
            { label: "Code APE", value: "74.10Z — Activités spécialisées de design" },
            {
              label: "Siège",
              value: "Bâtiment A, 36 rue Monttessuy, 91260 Juvisy-sur-Orge",
            },
            {
              label: "Email",
              value: (
                <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
                  {CONTACT}
                </a>
              ),
            },
            { label: "TVA", value: "Non applicable, art. 293 B du CGI" },
          ]}
        />
      </LegalSection>

      <LegalSection title="Directrice de la publication">
        <p>Madame Imen Mokrani, en qualité d&apos;exploitante.</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133,
          Walnut, CA 91789, États-Unis —{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-ink underline"
          >
            vercel.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Prestataires techniques">
        <p>
          Le fonctionnement du site et des réservations s&apos;appuie sur&nbsp;: Supabase
          (base de données), Stripe (paiement en ligne), Clerk (comptes et connexion) et
          Resend (envoi des emails de confirmation). Voir la{" "}
          <a href="/confidentialite" className="text-brand-ink underline">
            politique de confidentialité
          </a>{" "}
          pour le détail des traitements de données.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus du site (textes, photographies, illustrations,
          logo, marque «&nbsp;L&apos;Atelier aux 100 histoires&nbsp;», charte graphique)
          est protégé par le droit de la propriété intellectuelle. Toute reproduction,
          représentation ou réutilisation, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles et cookies">
        <p>
          Les modalités de collecte et de traitement de vos données, ainsi que l&apos;usage
          des cookies, sont décrits dans notre{" "}
          <a href="/confidentialite" className="text-brand-ink underline">
            politique de confidentialité
          </a>
          . Vous disposez de droits d&apos;accès, de rectification et de suppression que vous
          pouvez exercer à l&apos;adresse{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Conditions de vente et litiges">
        <p>
          Les ventes de places aux ateliers sont régies par nos{" "}
          <a href="/cgv" className="text-brand-ink underline">
            conditions générales de vente
          </a>
          . En cas de difficulté, contactez-nous en priorité à l&apos;adresse{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

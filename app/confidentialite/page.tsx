import { LegalDoc, LegalSection } from "@/components/LegalDoc";

export const metadata = { title: "Confidentialité — Atelier aux 100 histoires" };

const CONTACT = "atelieraux100histoires@gmail.com";

export default function Confidentialite() {
  return (
    <LegalDoc
      title="Politique de confidentialité"
      updated="11 juin 2026"
      meta={[{ label: "Responsable", value: "Imen Mokrani (EI)" }]}
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Les données personnelles collectées sur ce site sont traitées par Imen Mokrani,
          exploitante de <strong>L&apos;Atelier aux 100 histoires</strong> (entrepreneur
          individuel — siège&nbsp;: Bâtiment A, 36 rue Monttessuy, 91260 Juvisy-sur-Orge).
          Contact&nbsp;:{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Données collectées et finalités">
        <p>Nous collectons uniquement les données nécessaires aux finalités suivantes&nbsp;:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <strong>Réservation et billets</strong> — nom et email, détail de la commande.
            Base légale&nbsp;: exécution du contrat.
          </li>
          <li>
            <strong>Compte client</strong> (via Clerk) — email et identifiants de connexion,
            pour accéder à vos billets. Base légale&nbsp;: exécution du contrat.
          </li>
          <li>
            <strong>Paiement</strong> (via Stripe) — les données de carte bancaire sont
            saisies et traitées directement par Stripe&nbsp;; nous n&apos;y avons pas accès et
            ne les conservons pas. Base légale&nbsp;: exécution du contrat et obligation légale
            (comptabilité).
          </li>
          <li>
            <strong>Actualités et offres</strong> (newsletter, offre «&nbsp;réduction
            mystère&nbsp;») — email, uniquement si vous y consentez. Base légale&nbsp;:
            consentement.
          </li>
          <li>
            <strong>Demandes de devis et de partenariat</strong> — prénom, email, téléphone et
            informations renseignées dans le formulaire. Base légale&nbsp;: mesures
            précontractuelles / intérêt légitime.
          </li>
          <li>
            <strong>Mesure d&apos;audience</strong> (Vercel Analytics) — statistiques de
            fréquentation agrégées et anonymes, sans cookie publicitaire. Base légale&nbsp;:
            intérêt légitime.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Destinataires et sous-traitants">
        <p>
          Vos données ne sont jamais vendues. Elles sont accessibles à nos prestataires
          techniques, agissant comme sous-traitants&nbsp;: <strong>Supabase</strong> (base de
          données), <strong>Stripe</strong> (paiement), <strong>Clerk</strong> (comptes),{" "}
          <strong>Resend</strong> (emails) et <strong>Vercel</strong> (hébergement et mesure
          d&apos;audience). Certains de ces prestataires sont situés hors de l&apos;Union
          européenne&nbsp;; les transferts sont alors encadrés par des garanties appropriées
          (clauses contractuelles types de la Commission européenne et/ou Data Privacy
          Framework).
        </p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            Données de réservation et pièces comptables&nbsp;: conservées le temps de la
            relation, puis archivées pour la durée légale (jusqu&apos;à 10 ans pour les
            obligations comptables).
          </li>
          <li>Compte client&nbsp;: jusqu&apos;à sa suppression à votre demande.</li>
          <li>
            Prospects (newsletter / offres)&nbsp;: jusqu&apos;au retrait de votre consentement,
            et au maximum 3 ans après le dernier contact.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données,
          ainsi que du droit de retirer votre consentement à tout moment (notamment via le lien
          de désinscription présent dans nos emails). Pour exercer ces droits, écrivez à{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          . Vous pouvez aussi introduire une réclamation auprès de la CNIL —{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-ink underline"
          >
            cnil.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Le site utilise uniquement des cookies <strong>strictement nécessaires</strong> à son
          fonctionnement (maintien de votre session de connexion via Clerk et sécurisation du
          paiement via Stripe). La mesure d&apos;audience est réalisée sans cookie et de manière
          anonyme. Aucun cookie publicitaire ou de suivi tiers n&apos;est déposé&nbsp;; aucun
          consentement préalable n&apos;est donc requis pour ces cookies essentiels.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Les échanges sont chiffrés (HTTPS) et nous recourons à des prestataires reconnus
          mettant en œuvre des mesures de sécurité conformes à l&apos;état de l&apos;art pour
          protéger vos données.
        </p>
      </LegalSection>

      <LegalSection title="Modifications">
        <p>
          La présente politique peut être mise à jour. La date de dernière mise à jour figure
          en tête de ce document.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

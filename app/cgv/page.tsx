import { LegalDoc, LegalSection, LegalNote } from "@/components/LegalDoc";

export const metadata = { title: "CGV — Atelier aux 100 histoires" };

const CONTACT = "atelieraux100histoires@gmail.com";

export default function Cgv() {
  return (
    <LegalDoc
      title="Conditions générales de vente"
      updated="11 juin 2026"
      meta={[{ label: "Vendeur", value: "Imen Mokrani (EI)" }]}
    >
      <LegalSection title="1. Objet et acceptation">
        <p>
          Les présentes conditions générales de vente (CGV) régissent la vente en ligne de
          places («&nbsp;billets&nbsp;») aux ateliers créatifs proposés par{" "}
          <strong>L&apos;Atelier aux 100 histoires</strong> (Imen Mokrani, entrepreneur
          individuel — SIRET 888 299 559 00011, siège&nbsp;: Bâtiment A, 36 rue Monttessuy,
          91260 Juvisy-sur-Orge). Toute commande implique l&apos;acceptation pleine et
          entière des présentes CGV.
        </p>
      </LegalSection>

      <LegalSection title="2. Ateliers et billets">
        <p>
          Les ateliers sont des activités créatives encadrées, organisées à une{" "}
          <strong>date, une heure et un lieu déterminés</strong>, dans la limite des places
          disponibles. À l&apos;issue de la commande, un billet électronique nominatif
          (avec QR code) est délivré&nbsp;; il est à présenter à l&apos;entrée de
          l&apos;atelier.
        </p>
      </LegalSection>

      <LegalSection title="3. Prix">
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises. En application de
          l&apos;article 293 B du Code général des impôts, la TVA n&apos;est pas applicable
          (franchise en base)&nbsp;: les prix affichés sont nets, aucun montant de TVA
          n&apos;est facturé. Le prix applicable est celui affiché au moment de la
          validation de la commande.
        </p>
      </LegalSection>

      <LegalSection title="4. Commande et paiement">
        <p>
          La commande s&apos;effectue en ligne&nbsp;: choix de l&apos;atelier et du nombre
          de places, renseignement des informations demandées, puis paiement. Le paiement
          est traité de façon sécurisée par notre prestataire <strong>Stripe</strong>&nbsp;;
          aucune donnée de carte bancaire n&apos;est conservée par nos soins. La commande est
          confirmée par l&apos;envoi d&apos;un email récapitulatif et du billet électronique.
          Le défaut de paiement entraîne l&apos;annulation automatique de la réservation.
        </p>
      </LegalSection>

      <LegalSection title="5. Droit de rétractation">
        <p>
          Conformément à l&apos;article L221-28, 12° du Code de la consommation, le droit de
          rétractation de 14 jours <strong>ne s&apos;applique pas</strong> aux prestations de
          services de loisirs fournies à une date ou selon une périodicité déterminée. Nos
          ateliers entrant dans cette catégorie, votre commande est ferme dès sa validation.
        </p>
        <LegalNote>
          En validant votre achat, vous reconnaissez que la prestation est fournie à une date
          déterminée et renoncez expressément au droit de rétractation. La politique
          d&apos;annulation ci-dessous s&apos;applique en lieu et place.
        </LegalNote>
      </LegalSection>

      <LegalSection title="6. Annulation par le client">
        <p>Vous pouvez annuler votre participation dans les conditions suivantes&nbsp;:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <strong>7 jours ou plus avant l&apos;atelier</strong>&nbsp;: remboursement
            intégral des places annulées.
          </li>
          <li>
            <strong>Moins de 7 jours avant l&apos;atelier</strong>&nbsp;: pas de
            remboursement, mais un <strong>avoir</strong> d&apos;un montant équivalent, à
            faire valoir sur un autre atelier dans un délai de 12 mois.
          </li>
          <li>
            <strong>Absence le jour J (sans annulation préalable)</strong>&nbsp;: la place
            est due et n&apos;ouvre droit ni à remboursement ni à avoir.
          </li>
        </ul>
        <p>
          Toute demande d&apos;annulation se fait par email à{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          , la date de réception faisant foi.
        </p>
      </LegalSection>

      <LegalSection title="7. Annulation ou modification par l'organisateur">
        <p>
          Un atelier peut être annulé ou reporté en cas de force majeure, d&apos;indisponibilité
          du lieu partenaire ou d&apos;un nombre insuffisant de participants. Dans ce cas, nous
          vous proposons un report sur une autre date ou, à votre choix, le{" "}
          <strong>remboursement intégral</strong> des sommes versées. Aucune autre indemnité ne
          peut être réclamée.
        </p>
      </LegalSection>

      <LegalSection title="8. Déroulement, mineurs et sécurité">
        <p>
          Le matériel nécessaire est fourni sur place. Les participants s&apos;engagent à
          respecter les consignes de sécurité et le matériel mis à disposition. Les ateliers
          sont ouverts à tous les âges&nbsp;; un enfant mineur doit être accompagné d&apos;un
          adulte responsable ou disposer d&apos;une autorisation parentale. Merci de nous
          signaler à l&apos;avance toute allergie ou contre-indication. L&apos;organisateur
          ne saurait être tenu responsable des effets personnels des participants.
        </p>
      </LegalSection>

      <LegalSection title="9. Réclamation et médiation de la consommation">
        <p>
          Pour toute réclamation, contactez-nous d&apos;abord à{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand-ink underline">
            {CONTACT}
          </a>
          . Conformément aux articles L611-1 et suivants du Code de la consommation, vous
          pouvez, à défaut de solution amiable, recourir gratuitement à un médiateur de la
          consommation&nbsp;: <strong>[à compléter — nom et coordonnées du médiateur]</strong>.
          Vous pouvez également utiliser la plateforme européenne de règlement en ligne des
          litiges&nbsp;:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-ink underline"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="10. Données personnelles">
        <p>
          Les données collectées lors de la commande sont traitées conformément à notre{" "}
          <a href="/confidentialite" className="text-brand-ink underline">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="11. Droit applicable">
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, et après
          recherche d&apos;une solution amiable, les tribunaux français sont compétents.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

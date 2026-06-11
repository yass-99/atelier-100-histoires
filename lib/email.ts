import "server-only";
import { Resend } from "resend";
import type { Booking, Session } from "./types";
import { formatEUR } from "./money";
import {
  confirmationEmailHtml,
  leadWelcomeEmailHtml,
  abandonedCartEmailHtml,
  devisAckEmailHtml,
  partenaireAckEmailHtml,
} from "./email-template";
import { OCCASIONS, type DevisInput } from "./devis.shared";
import { TYPES_LIEU, CRENEAUX, type PartenaireInput } from "./partenaire.shared";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM!;

/**
 * Envoie via Resend en faisant remonter les erreurs API. Le SDK Resend ne lève
 * PAS d'exception quand l'API refuse l'envoi (domaine non vérifié, destinataire
 * bloqué en mode test, clé invalide…) : il renvoie { data, error }. Sans ce
 * garde-fou, ces refus passent totalement inaperçus.
 */
async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error("Resend a refusé l'envoi :", error);
    throw new Error(`Resend: ${error.name} — ${error.message}`);
  }
  return data;
}

/** Email de bienvenue après capture du lead « réduction mystère ». */
export async function sendLeadWelcome(email: string, pct: number) {
  await send({
    from: FROM,
    to: email,
    subject: `Ta réduction de −${pct} % t'attend ✦`,
    html: leadWelcomeEmailHtml(pct),
  });
}

/** Relance après expiration d'une session de paiement (panier abandonné). */
export async function sendAbandonedCart(b: Booking, s: Session) {
  await send({
    from: FROM,
    to: b.email,
    subject: `Ta place pour « ${s.titre} » t'attend encore`,
    html: abandonedCartEmailHtml(b, s),
  });
}

export async function sendConfirmation(b: Booking, s: Session) {
  await send({
    from: FROM,
    to: b.email,
    subject: `Réservation confirmée — ${s.titre}`,
    html: confirmationEmailHtml(b, s),
  });
}

/** Accusé immédiat (e-ticket) au client après une demande de devis. */
export async function sendDevisAck(d: DevisInput & { id: string }) {
  const occasionLabel = OCCASIONS.find((o) => o.value === d.occasion)?.label ?? d.occasion;
  await send({
    from: FROM,
    to: d.email,
    subject: "On a bien reçu ta demande d'atelier privé ✦",
    html: devisAckEmailHtml({
      prenom: d.prenom,
      occasionLabel,
      nbPersonnes: d.nb_personnes,
      dates: d.dates_souhaitees,
      ref: d.id.slice(0, 8).toUpperCase(),
    }),
  });
}

/** Notifie l'équipe d'une nouvelle demande de devis (pour répondre à la main). */
export async function notifyDevisRequest(d: DevisInput & { id: string }) {
  const to = process.env.ORGANIZER_EMAIL;
  if (!to) return;
  const occasion = OCCASIONS.find((o) => o.value === d.occasion)?.label ?? d.occasion;
  const row = (label: string, value: string | number | null) =>
    value ? `<tr><td style="padding:2px 8px 2px 0;font-weight:700;">${label}</td><td>${value}</td></tr>` : "";
  await send({
    from: FROM,
    to,
    subject: `Nouvelle demande d'atelier privé — ${occasion} (${d.prenom})`,
    html: `<p>Nouvelle demande de devis « Crée ton atelier » :</p>
      <table cellpadding="0" cellspacing="0" style="font-size:14px;">
        ${row("Prénom", d.prenom)}
        ${row("Email", d.email)}
        ${row("Téléphone", d.phone)}
        ${row("Occasion", occasion)}
        ${row("Personnes", d.nb_personnes)}
        ${row("Type d'atelier", d.type_atelier)}
        ${row("Dates souhaitées", d.dates_souhaitees)}
        ${row("Message", d.message)}
        ${row("Source", d.source)}
        ${row("Réf.", d.id.slice(0, 8).toUpperCase())}
      </table>`,
  });
}

/** Accusé immédiat (ticket) au lieu après une candidature de partenariat. */
export async function sendPartenaireAck(p: PartenaireInput & { id: string }) {
  const typeLabel = TYPES_LIEU.find((t) => t.value === p.type_lieu)?.label ?? p.type_lieu;
  await send({
    from: FROM,
    to: p.email,
    subject: "On a bien reçu votre candidature partenaire ✦",
    html: partenaireAckEmailHtml({
      prenom: p.prenom,
      nomLieu: p.nom_lieu,
      typeLabel,
      ville: p.ville,
      placesAssises: p.places_assises,
      ref: p.id.slice(0, 8).toUpperCase(),
    }),
  });
}

/** Notifie l'équipe d'une nouvelle candidature partenaire (pour étude à la main). */
export async function notifyPartenaireRequest(p: PartenaireInput & { id: string }) {
  const to = process.env.ORGANIZER_EMAIL;
  if (!to) return;
  const typeLabel = TYPES_LIEU.find((t) => t.value === p.type_lieu)?.label ?? p.type_lieu;
  const creneaux = p.creneaux
    .map((c) => CRENEAUX.find((x) => x.value === c)?.label ?? c)
    .join(", ");
  const row = (label: string, value: string | number | null) =>
    value ? `<tr><td style="padding:2px 8px 2px 0;font-weight:700;">${label}</td><td>${value}</td></tr>` : "";
  await send({
    from: FROM,
    to,
    subject: `Nouveau lieu partenaire — ${p.nom_lieu} (${typeLabel})`,
    html: `<p>Nouvelle candidature « Devenir lieu partenaire » :</p>
      <table cellpadding="0" cellspacing="0" style="font-size:14px;">
        ${row("Établissement", p.nom_lieu)}
        ${row("Type", typeLabel)}
        ${row("Prénom", p.prenom)}
        ${row("Email", p.email)}
        ${row("Téléphone", p.phone)}
        ${row("Ville / quartier", p.ville)}
        ${row("Places assises", p.places_assises)}
        ${row("Créneaux", creneaux)}
        ${row("Lien", p.lien)}
        ${row("Message", p.message)}
        ${row("Source", p.source)}
        ${row("Réf.", p.id.slice(0, 8).toUpperCase())}
      </table>`,
  });
}

export async function notifyOrganizer(b: Booking, s: Session) {
  const to = process.env.ORGANIZER_EMAIL;
  if (!to) return;
  await send({
    from: FROM,
    to,
    subject: `Nouvelle inscription — ${s.titre}`,
    html: `<p><b>${b.nom}</b> (${b.email}) vient de réserver
      ${b.nb_places} place(s) sur « ${s.titre} » — ${formatEUR(b.montant_cents)}.</p>`,
  });
}

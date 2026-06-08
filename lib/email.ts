import "server-only";
import { Resend } from "resend";
import type { Booking, Session } from "./types";
import { formatEUR } from "./money";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM!;

export async function sendConfirmation(b: Booking, s: Session) {
  const date = new Date(s.date_heure).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });
  await resend.emails.send({
    from: FROM,
    to: b.email,
    subject: `Confirmation — ${s.titre}`,
    html: `<p>Bonjour ${b.nom},</p>
      <p>Votre réservation pour <b>${s.titre}</b> est confirmée.</p>
      <ul>
        <li>${date}</li>
        <li>${s.lieu}</li>
        <li>${b.nb_places} place(s) — ${formatEUR(b.montant_cents)}</li>
      </ul>
      <p>À très bientôt !</p>
      <p>— Atelier aux 100 histoires</p>`,
  });
}

export async function notifyOrganizer(b: Booking, s: Session) {
  const to = process.env.ORGANIZER_EMAIL;
  if (!to) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nouvelle inscription — ${s.titre}`,
    html: `<p><b>${b.nom}</b> (${b.email}) vient de réserver
      ${b.nb_places} place(s) sur « ${s.titre} » — ${formatEUR(b.montant_cents)}.</p>`,
  });
}

import type { Booking, Session } from "./types";
import { formatEUR } from "./money";

const TZ = "Europe/Paris";

// Couleurs de la DA (en dur : un email ne charge pas le design system).
const C = {
  cream: "#fbf5e4",
  white: "#ffffff",
  ink: "#121317",
  navy: "#1b2238",
  muted: "#6c7180",
  brand: "#3b4ed8",
  brandSoft: "#e0e4fb",
  mint: "#1f9d5f",
  mintSoft: "#d8efe0",
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function infoCell(label: string, value: string): string {
  return `<td style="padding:6px 0;vertical-align:top;width:50%;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${C.muted};">${label}</div>
    <div style="font-size:15px;font-weight:800;color:${C.navy};margin-top:2px;">${value}</div>
  </td>`;
}

/** Email de confirmation en forme de ticket (DA crème/navy). */
export function confirmationEmailHtml(b: Booking, s: Session): string {
  const jour = cap(
    new Date(s.date_heure).toLocaleDateString("fr-FR", {
      timeZone: TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
  const heure = new Date(s.date_heure).toLocaleTimeString("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  const ref = b.id.slice(0, 8).toUpperCase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const billetUrl = `${appUrl}/merci?b=${b.id}`; // page publique du/des billet(s), sans connexion
  const multi = b.nb_places > 1;
  const billetMot = multi ? "mes billets" : "mon billet"; // distinction singulier/pluriel
  const places = `${b.nb_places} place${multi ? "s" : ""}`;

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Réservation confirmée</title></head>
<body style="margin:0;padding:0;background:${C.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};font-family:${FONT};">
    <tr><td align="center" style="padding:28px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- Bandeau de validation -->
        <tr><td align="center" style="padding-bottom:18px;">
          <span style="display:inline-block;background:${C.mintSoft};color:${C.mint};font-size:13px;font-weight:800;padding:8px 16px;border-radius:999px;">✓ Réservation confirmée</span>
        </td></tr>

        <!-- Ticket -->
        <tr><td style="background:${C.white};border:1.5px solid ${C.ink};border-radius:20px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

            <!-- Talon récap -->
            <tr><td style="background:${C.brandSoft};padding:22px 24px;">
              <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${C.navy};opacity:.65;">Atelier aux 100 histoires</div>
              <div style="font-size:22px;font-weight:900;color:${C.navy};margin-top:6px;line-height:1.2;">${s.titre}</div>
              <div style="font-size:13px;font-weight:700;color:${C.navy};margin-top:8px;">${jour} · ${heure}</div>
            </td></tr>

            <!-- Perforation -->
            <tr><td style="padding:0 18px;"><div style="border-top:2px dashed ${C.ink};opacity:.28;height:0;line-height:0;font-size:0;">&nbsp;</div></td></tr>

            <!-- Corps -->
            <tr><td style="padding:20px 24px 24px;">
              <p style="margin:0 0 10px;font-size:15px;color:${C.navy};">Merci infiniment <b>${b.nom}</b> pour ta réservation — ça compte beaucoup pour nous.</p>
              <p style="margin:0 0 16px;font-size:15px;color:${C.navy};">${multi ? "Tes places sont confirmées" : "Ta place est confirmée"} pour <b>${s.titre}</b>. On a hâte de t'accueillir et de créer avec toi&nbsp;!</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>${infoCell("Lieu", s.lieu || "—")}${infoCell("Places", `${places} — ${formatEUR(b.montant_cents)}`)}</tr>
                <tr>${infoCell("Date", jour)}${infoCell("Heure", heure)}</tr>
                <tr>${infoCell("Réf. réservation", ref)}<td></td></tr>
              </table>

              <div style="margin-top:22px;">
                <a href="${billetUrl}" style="display:inline-block;background:${C.ink};color:${C.white};text-decoration:none;font-size:15px;font-weight:800;padding:14px 22px;border-radius:999px;">Voir ${billetMot}&nbsp;→</a>
              </div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Pied -->
        <tr><td align="center" style="padding:18px 8px 0;">
          <div style="font-size:12px;color:${C.muted};">Présente le QR de ${multi ? "tes billets" : "ton billet"} à l'entrée.</div>
          <div style="font-size:13px;color:${C.navy};margin-top:10px;font-weight:700;">Avec toute notre gratitude,</div>
          <div style="font-size:13px;color:${C.muted};margin-top:2px;">l'équipe de l'Atelier aux 100 histoires</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

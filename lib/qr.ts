import QRCode from "qrcode";

/** QR encodé en data URL PNG (génération serveur, sans appel réseau). */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 240,
    color: { dark: "#111114", light: "#ffffff" },
  });
}

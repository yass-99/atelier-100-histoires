import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getBooking } from "@/lib/bookings";
import { finalizeIfPaid } from "@/lib/order";
import { getSession } from "@/lib/sessions";
import { qrDataUrl } from "@/lib/qr";
import { ConfirmationReveal } from "@/components/ConfirmationReveal";
import { TicketCarousel } from "@/components/TicketCarousel";
import { SignInIncentive } from "@/components/SignInIncentive";
import { TrackPurchase } from "@/components/TrackPurchase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réservation confirmée — Atelier aux 100 histoires" };

export default async function Merci({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const { b } = await searchParams;
  const found = b ? await getBooking(b) : null;
  // Filet de sécurité : confirme + envoie l'email de confirmation si le webhook
  // n'est pas (encore) passé. L'email ne part qu'une fois (cf. finalizeBooking).
  const booking = found ? await finalizeIfPaid(found) : null;
  const session = booking ? await getSession(booking.session_id) : null;

  // Fallback gracieux (lien direct, booking introuvable…)
  if (!booking || !session) {
    return (
      <main className="screen py-12">
        <div className="card text-center">
          <h1 className="font-display text-2xl">Réservation confirmée&nbsp;!</h1>
          <p className="mt-2 text-muted">Un email de confirmation t&apos;a été envoyé.</p>
          <Link href="/" className="btn-primary mt-6 w-full">Découvrir d&apos;autres ateliers</Link>
        </div>
      </main>
    );
  }

  // Un QR distinct par place réservée → chaque billet est scannable individuellement.
  const total = Math.max(1, booking.nb_places);
  const qrs = await Promise.all(
    Array.from({ length: total }, (_, i) => qrDataUrl(`${booking.id}:${i + 1}/${total}`)),
  );

  let signedIn = false;
  try {
    const { userId } = await auth();
    signedIn = !!userId;
  } catch {
    signedIn = false; // wiring Clerk côté serveur indéterminé → défaut anonyme
  }

  return (
    <main className="screen py-8 pb-12">
      {booking.statut === "confirmed" && (
        <TrackPurchase
          id={booking.id}
          valueEur={booking.montant_cents / 100}
          places={booking.nb_places}
          sessionId={booking.session_id}
        />
      )}
      <ConfirmationReveal>
        <TicketCarousel b={booking} s={session} qrs={qrs} />
        <SignInIncentive signedIn={signedIn} email={booking.email} />
        <Link href="/" className="btn-ghost mt-4 w-full justify-between">
          Découvrir d&apos;autres ateliers
          <span className="arrow-fab h-10 w-10"><ArrowRight className="h-5 w-5" strokeWidth={1.8} /></span>
        </Link>
      </ConfirmationReveal>
    </main>
  );
}

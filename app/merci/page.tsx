import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getBooking } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { qrDataUrl } from "@/lib/qr";
import { Pop } from "@/components/motion";
import { Ticket } from "@/components/Ticket";
import { SignInIncentive } from "@/components/SignInIncentive";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réservation confirmée — Atelier des 100 histoires" };

export default async function Merci({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const { b } = await searchParams;
  const booking = b ? await getBooking(b) : null;
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

  const qr = await qrDataUrl(booking.id);

  let signedIn = false;
  try {
    const { userId } = await auth();
    signedIn = !!userId;
  } catch {
    signedIn = false; // wiring Clerk côté serveur indéterminé → défaut anonyme
  }

  return (
    <main className="screen py-8 pb-12">
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-7 w-7" strokeWidth={2.4} aria-hidden />
        </span>
        <h1 className="mt-3 font-display text-2xl">Réservation confirmée&nbsp;!</h1>
      </div>
      <Pop>
        <Ticket b={booking} s={session} qr={qr} />
      </Pop>
      <SignInIncentive signedIn={signedIn} email={booking.email} />
      <Link href="/" className="btn-ghost mt-4 w-full justify-between">
        Découvrir d&apos;autres ateliers
        <span className="arrow-fab h-10 w-10"><ArrowRight className="h-5 w-5" strokeWidth={1.8} /></span>
      </Link>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { getBooking } from "@/lib/bookings";
import { getSession } from "@/lib/sessions";
import { qrDataUrl } from "@/lib/qr";
import { Reveal } from "@/components/motion";
import { CircleButton } from "@/components/CircleButton";
import { TicketCarousel } from "@/components/TicketCarousel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon billet — Atelier aux 100 histoires" };

export default async function BilletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const booking = await getBooking(id);
  if (!booking) notFound();

  // Contrôle de propriété : même compte Clerk OU même email.
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;
  const owns =
    booking.clerk_user_id === userId ||
    (!!email && booking.email.toLowerCase() === email.toLowerCase());
  if (!owns) notFound();

  const session = await getSession(booking.session_id);
  if (!session) notFound();

  const total = Math.max(1, booking.nb_places);
  const qrs = await Promise.all(
    Array.from({ length: total }, (_, i) => qrDataUrl(`${booking.id}:${i + 1}/${total}`)),
  );

  return (
    <main className="screen py-6 pb-12">
      <div className="mb-5 flex items-center gap-3">
        <CircleButton as="link" href="/mes-billets" label="Retour à mes billets">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </CircleButton>
        <h1 className="font-display text-2xl">
          {total > 1 ? "Mes billets" : "Mon billet"}
        </h1>
      </div>

      <Reveal>
        <TicketCarousel b={booking} s={session} qrs={qrs} />
      </Reveal>

      <Link href="/" className="btn-ghost mt-6 w-full">
        Découvrir d&apos;autres ateliers
      </Link>
    </main>
  );
}

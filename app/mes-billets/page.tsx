import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { TicketCheck, CalendarDays, ArrowRight } from "lucide-react";
import { listUserBookings, linkBookingsToUser, type BookingWithSession } from "@/lib/bookings";
import { capitalizeFirst, formatDateLong } from "@/lib/ui";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes billets — Atelier aux 100 histoires" };

/** Sépare les réservations en « à venir » (triées) et « passées ». */
function partition(bookings: BookingWithSession[]) {
  const now = Date.now();
  const ts = (b: BookingWithSession) =>
    b.session ? new Date(b.session.date_heure).getTime() : 0;
  const upcoming = bookings
    .filter((b) => b.session && ts(b) >= now)
    .sort((a, b) => ts(a) - ts(b));
  const past = bookings.filter((b) => !b.session || ts(b) < now);
  return { upcoming, past };
}

function BookingCard({ b, past }: { b: BookingWithSession; past?: boolean }) {
  const titre = b.session?.titre ?? "Atelier";
  return (
    <Link
      href={`/billets/${b.id}`}
      className="card flex items-center gap-4 transition active:scale-[.99]"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg leading-tight">{titre}</h3>
        {b.session && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {capitalizeFirst(formatDateLong(b.session.date_heure))}
          </p>
        )}
        <p className="mt-1 text-sm font-bold">
          {b.nb_places} billet{b.nb_places > 1 ? "s" : ""}
        </p>
      </div>
      <span
        className={`arrow-fab h-10 w-10 ${past ? "bg-background text-ink border-[1.5px] border-ink" : "bg-ink text-on-ink"}`}
        aria-hidden
      >
        <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
      </span>
    </Link>
  );
}

export default async function MesBilletsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;

  // Rattache d'abord les billets achetés avec le même email (avant le compte).
  await linkBookingsToUser(userId, email);
  const bookings = await listUserBookings(userId, email);
  const { upcoming, past } = partition(bookings);

  return (
    <main className="screen space-y-8 py-8">
      <Reveal>
        <p className="eyebrow text-muted">Mon espace</p>
        <h1 className="mt-2 font-display text-[34px] leading-[1.05]">Mes billets</h1>
      </Reveal>

      {bookings.length === 0 ? (
        <Reveal>
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <TicketCheck className="h-7 w-7" strokeWidth={1.7} />
            </span>
            <p className="font-display text-xl">Aucun billet pour l&apos;instant</p>
            <p className="text-muted">Tes réservations apparaîtront ici.</p>
            <Link href="/" className="btn-primary mt-2">
              Découvrir les ateliers <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Reveal>
              <h2 className="mb-3 font-display text-xl">À venir</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} b={b} />
                ))}
              </div>
            </Reveal>
          )}

          {past.length > 0 && (
            <Reveal>
              <h2 className="mb-3 font-display text-xl">Passés</h2>
              <div className="space-y-3 opacity-80">
                {past.map((b) => (
                  <BookingCard key={b.id} b={b} past />
                ))}
              </div>
            </Reveal>
          )}
        </>
      )}
    </main>
  );
}

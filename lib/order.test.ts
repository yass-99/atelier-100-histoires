import { describe, it, expect, vi, beforeEach } from "vitest";

// `order.ts` est server-only et orchestre plusieurs modules serveur : on les
// remplace par des mocks pour tester la LOGIQUE de finalisation en isolation.
vi.mock("server-only", () => ({}));
vi.mock("./bookings", () => ({ confirmBooking: vi.fn() }));
vi.mock("./sessions", () => ({ getSession: vi.fn() }));
vi.mock("./leads", () => ({ markDiscountUsed: vi.fn() }));
vi.mock("./email", () => ({ sendConfirmation: vi.fn(), notifyOrganizer: vi.fn() }));
vi.mock("./stripe", () => ({
  stripe: { checkout: { sessions: { retrieve: vi.fn() } } },
}));

import { finalizeBooking, finalizeIfPaid } from "./order";
import { confirmBooking } from "./bookings";
import { getSession } from "./sessions";
import { markDiscountUsed } from "./leads";
import { sendConfirmation, notifyOrganizer } from "./email";
import { stripe } from "./stripe";
import type { Booking } from "./types";

const mConfirm = vi.mocked(confirmBooking);
const mGetSession = vi.mocked(getSession);
const mMark = vi.mocked(markDiscountUsed);
const mSend = vi.mocked(sendConfirmation);
const mNotify = vi.mocked(notifyOrganizer);
const mRetrieve = vi.mocked(stripe.checkout.sessions.retrieve);

const pending = { id: "b1", session_id: "s1", email: "buyer@x.fr", statut: "pending", stripe_session_id: "cs_1" } as unknown as Booking;
const confirmed = { ...pending, statut: "confirmed" } as Booking;
const session = { id: "s1", titre: "Atelier" } as unknown as Parameters<typeof sendConfirmation>[1];

beforeEach(() => vi.clearAllMocks());

describe("finalizeBooking", () => {
  it("consomme la remise ET envoie les emails quand l'achat est finalisé (gagnant de la transition)", async () => {
    mConfirm.mockResolvedValue(confirmed);
    mGetSession.mockResolvedValue(session as never);

    const r = await finalizeBooking("cs_1", "winner@x.fr");

    expect(r).toBe(confirmed);
    expect(mMark).toHaveBeenCalledTimes(1);
    expect(mMark).toHaveBeenCalledWith("winner@x.fr"); // la remise s'annule à l'achat
    expect(mSend).toHaveBeenCalledTimes(1);
    expect(mNotify).toHaveBeenCalledTimes(1);
  });

  it("ne refait RIEN si la réservation est déjà finalisée par l'autre chemin (pas de double envoi / double consommation)", async () => {
    mConfirm.mockResolvedValue(null); // perdant de la transition atomique

    const r = await finalizeBooking("cs_1", "winner@x.fr");

    expect(r).toBeNull();
    expect(mMark).not.toHaveBeenCalled();
    expect(mSend).not.toHaveBeenCalled();
  });

  it("n'appelle pas markDiscountUsed s'il n'y avait pas de remise (mystery_email vide)", async () => {
    mConfirm.mockResolvedValue(confirmed);
    mGetSession.mockResolvedValue(session as never);

    await finalizeBooking("cs_1", "");

    expect(mMark).not.toHaveBeenCalled();
    expect(mSend).toHaveBeenCalledTimes(1); // l'email part quand même
  });
});

describe("finalizeIfPaid (filet /merci)", () => {
  it("consomme la remise quand le paiement est confirmé côté Stripe", async () => {
    mRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { mystery_email: "winner@x.fr" },
    } as never);
    mConfirm.mockResolvedValue(confirmed);
    mGetSession.mockResolvedValue(session as never);

    await finalizeIfPaid(pending);

    expect(mMark).toHaveBeenCalledWith("winner@x.fr");
  });

  it("ne finalise rien si Stripe dit non payé", async () => {
    mRetrieve.mockResolvedValue({ payment_status: "unpaid", metadata: {} } as never);

    const r = await finalizeIfPaid(pending);

    expect(r).toBe(pending);
    expect(mConfirm).not.toHaveBeenCalled();
    expect(mMark).not.toHaveBeenCalled();
  });

  it("ignore une réservation déjà confirmée (pas de re-consommation au refresh de /merci)", async () => {
    const r = await finalizeIfPaid(confirmed);

    expect(r).toBe(confirmed);
    expect(mRetrieve).not.toHaveBeenCalled();
    expect(mConfirm).not.toHaveBeenCalled();
    expect(mMark).not.toHaveBeenCalled();
  });
});

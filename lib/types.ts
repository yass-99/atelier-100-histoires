export type SessionStatus = "brouillon" | "publie" | "annule";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Session = {
  id: string;
  titre: string;
  description: string;
  date_heure: string;
  duree: number;
  lieu: string;
  capacite: number;
  prix_cents: number;
  image_url: string | null;
  statut: SessionStatus;
  places_reservees: number;
  created_at: string;
};

export type Booking = {
  id: string;
  session_id: string;
  clerk_user_id: string | null;
  email: string;
  nom: string;
  nb_places: number;
  montant_cents: number;
  statut: BookingStatus;
  stripe_session_id: string | null;
  created_at: string;
};

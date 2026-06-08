-- Atelier des 100 histoires — schéma initial + RPC atomiques
-- À exécuter dans Supabase → SQL Editor (projet lnqnqwbwlatiehhgxjhq).

-- Enums
create type session_status as enum ('brouillon', 'publie', 'annule');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

-- Ateliers
create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  titre            text not null,
  description      text not null default '',
  date_heure       timestamptz not null,
  duree            int not null default 120,         -- minutes
  lieu             text not null default '',
  capacite         int not null check (capacite > 0),
  prix_cents       int not null check (prix_cents >= 0),
  statut           session_status not null default 'brouillon',
  places_reservees int not null default 0 check (places_reservees >= 0),
  created_at       timestamptz not null default now()
);

-- Réservations
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete restrict,
  clerk_user_id     text,
  email             text not null,
  nom               text not null,
  nb_places         int not null check (nb_places > 0),
  montant_cents     int not null,
  statut            booking_status not null default 'pending',
  stripe_session_id text unique,
  created_at        timestamptz not null default now()
);
create index on public.bookings(session_id);
create index on public.bookings(stripe_session_id);

-- RLS activé ; aucun accès anon (tout passe par le serveur avec la clé secrète)
alter table public.sessions enable row level security;
alter table public.bookings enable row level security;

-- Réservation ATOMIQUE de places : true si OK, false si plus de place
create or replace function public.reserve_seats(p_session_id uuid, p_qty int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare ok uuid;
begin
  update sessions
  set places_reservees = places_reservees + p_qty
  where id = p_session_id
    and statut = 'publie'
    and places_reservees + p_qty <= capacite
  returning id into ok;
  return ok is not null;
end;
$$;

-- Libération de places (panier abandonné / paiement échoué)
create or replace function public.release_seats(p_session_id uuid, p_qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update sessions
  set places_reservees = greatest(0, places_reservees - p_qty)
  where id = p_session_id;
end;
$$;

-- Jeu de données de démonstration (à supprimer plus tard)
insert into public.sessions (titre, description, date_heure, duree, lieu, capacite, prix_cents, statut)
values
  ('Écrire sa première histoire',
   'Un atelier pour poser les bases du récit et oser écrire votre première nouvelle.',
   now() + interval '7 day', 120, 'Paris 11e', 10, 3500, 'publie'),
  ('L''art du conte',
   'Trouver sa voix de conteur et captiver un auditoire.',
   now() + interval '14 day', 90, 'Lyon 1er', 8, 2800, 'publie'),
  ('Poésie & images',
   'Jouer avec les mots et les images pour créer des poèmes vivants.',
   now() + interval '21 day', 120, 'En ligne', 12, 3000, 'publie');

-- Public visé & consommation sur place par atelier.
-- À exécuter dans Supabase → SQL Editor (projet lnqnqwbwlatiehhgxjhq).
alter table public.sessions
  add column if not exists public_cible text not null default 'tous'
    check (public_cible in ('adultes','enfants','tous')),
  add column if not exists age_minimum int,
  add column if not exists conso_incluse boolean not null default false,
  add column if not exists conso_detail text;

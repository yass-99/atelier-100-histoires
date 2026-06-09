-- Capture email « réduction mystère » + consentement marketing (RGPD).
-- À exécuter dans Supabase → SQL Editor (projet lnqnqwbwlatiehhgxjhq).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent boolean not null,
  consented_at timestamptz not null default now(),
  discount_pct int not null check (discount_pct in (5, 10, 15)),
  used_at timestamptz,
  created_at timestamptz not null default now()
);
-- Accès uniquement via la clé secrète serveur (aucune policy publique).
alter table public.leads enable row level security;

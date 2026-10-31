-- ============================================================
-- Mariage Laure & Gaspard — base des réponses (Supabase)
-- Déjà installé sur le projet Supabase « Mariage » (organisation Gaspard).
-- Gardé ici comme référence, ou pour réinstaller sur un nouveau projet.
-- ============================================================

-- 1. Réponses des invités
create table if not exists public.reponses (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  presence         boolean not null,
  ceremonie        boolean not null default false,
  soiree           boolean not null default false,
  brunch           boolean not null default false,
  adultes          smallint not null default 0 check (adultes between 0 and 7),
  enfants_plus_10  smallint not null default 0 check (enfants_plus_10 between 0 and 7),
  enfants_moins_10 smallint not null default 0 check (enfants_moins_10 between 0 and 7),
  allergies        text check (allergies is null or char_length(allergies) <= 1000),
  noms             text not null check (char_length(noms) between 2 and 500),
  -- si la personne vient : au moins un moment choisi et au moins une personne
  constraint reponse_coherente check (
    presence = false
    or ((ceremonie or soiree or brunch) and adultes + enfants_plus_10 + enfants_moins_10 >= 1)
  )
);

-- 2. Liste des comptes autorisés à lire les réponses
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('gaspardmariage18@gmail.com')
on conflict do nothing;
-- Pour donner aussi l'accès à Laure, décommentez la ligne suivante :
-- insert into public.admins (email) values ('laure.geant@gmail.com') on conflict do nothing;

-- 3. Fonction "suis-je administrateur ?"
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

-- 4. Sécurité (Row Level Security)
alter table public.reponses enable row level security;
alter table public.admins   enable row level security;  -- aucune règle : table invisible depuis le site

-- Les invités (non connectés) peuvent seulement AJOUTER une réponse.
drop policy if exists "invites_ajoutent" on public.reponses;
create policy "invites_ajoutent" on public.reponses
  for insert to anon, authenticated
  with check (true);

-- Seuls les administrateurs peuvent LIRE les réponses.
drop policy if exists "admins_lisent" on public.reponses;
create policy "admins_lisent" on public.reponses
  for select to authenticated
  using (public.is_admin());

-- Seuls les administrateurs peuvent SUPPRIMER une réponse (doublons).
drop policy if exists "admins_suppriment" on public.reponses;
create policy "admins_suppriment" on public.reponses
  for delete to authenticated
  using (public.is_admin());

-- Droits de base sur la table
revoke all on public.reponses from anon, authenticated;
revoke all on public.admins from anon, authenticated;
grant insert on public.reponses to anon, authenticated;
grant select, delete on public.reponses to authenticated;

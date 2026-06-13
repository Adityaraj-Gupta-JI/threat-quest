-- Enable required extensions
create extension if not exists pgcrypto;

-- 1) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  security_score int not null default 100,
  xp int not null default 0,
  shield_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2) Scans table
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scan_type text not null check (scan_type in ('url', 'email')),
  target text not null,
  risk_level text not null check (risk_level in ('safe', 'risky', 'blocked')),
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- 3) Badges table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_name text not null,
  awarded_at timestamptz not null default timezone('utc', now()),
  unique (user_id, badge_name)
);

-- 4) Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 5) Enable RLS
alter table public.profiles enable row level security;
alter table public.scans enable row level security;
alter table public.user_badges enable row level security;

-- 6) Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- 7) Scans policies
drop policy if exists "scans_select_own" on public.scans;
create policy "scans_select_own"
on public.scans
for select
using (auth.uid() = user_id);

drop policy if exists "scans_insert_own" on public.scans;
create policy "scans_insert_own"
on public.scans
for insert
with check (auth.uid() = user_id);

drop policy if exists "scans_update_own" on public.scans;
create policy "scans_update_own"
on public.scans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "scans_delete_own" on public.scans;
create policy "scans_delete_own"
on public.scans
for delete
using (auth.uid() = user_id);

-- 8) Badges policies
drop policy if exists "badges_select_own" on public.user_badges;
create policy "badges_select_own"
on public.user_badges
for select
using (auth.uid() = user_id);

drop policy if exists "badges_insert_own" on public.user_badges;
create policy "badges_insert_own"
on public.user_badges
for insert
with check (auth.uid() = user_id);

drop policy if exists "badges_delete_own" on public.user_badges;
create policy "badges_delete_own"
on public.user_badges
for delete
using (auth.uid() = user_id);
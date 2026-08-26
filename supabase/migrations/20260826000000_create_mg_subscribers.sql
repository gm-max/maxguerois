-- maxguerois.com newsletter capture.
--
-- Applied to the `ouros-health` Supabase project (jkfqzypiomdxwmjkexpd) on 2026-08-26.
-- It shares that project because the free plan caps an organisation at two active
-- projects and both slots were already taken by live products. The tables are named
-- and scoped so that sharing a project never means sharing data or limits.
--
-- WHY THE TABLE IS NOT CALLED `subscribers`, which is the obvious name:
-- vps/bin/founder_card.py in the max-503A repo counts the table named `subscribers`
-- for Ouros Lab and prints it in the daily founder report. A name collision here
-- would have inflated a venture metric with personal-newsletter rows, silently.

create table if not exists public.mg_subscribers (
  id                   uuid primary key default gen_random_uuid(),
  -- citext, so Max@… and max@… cannot become two subscribers.
  email                citext not null unique,
  created_at           timestamptz not null default now(),
  unsubscribed_at      timestamptz,
  ip_hash              text,
  source               text not null default 'site',
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  -- NULL means beehiiv never confirmed the add. This is the drift detector:
  -- Supabase is the source of truth, so a failed send-layer call must stay
  -- visible and replayable instead of vanishing.
  synced_at            timestamptz,
  sync_error           text
);

-- Own rate-limit ledger. public.rate_limit_hits is shared by ouros.health and has
-- no surface column, so reusing it would let a maxguerois.com visitor exhaust the
-- ouros.health limit for their IP.
create table if not exists public.mg_rate_limit_hits (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

create index if not exists mg_subscribers_created_at_idx
  on public.mg_subscribers (created_at desc);
-- Partial index over the rows beehiiv never confirmed, so a replay job stays cheap
-- however large the table gets.
create index if not exists mg_subscribers_unsynced_idx
  on public.mg_subscribers (created_at) where synced_at is null;
create index if not exists mg_rate_limit_hits_ip_created_idx
  on public.mg_rate_limit_hits (ip_hash, created_at desc);

alter table public.mg_subscribers     enable row level security;
alter table public.mg_rate_limit_hits enable row level security;

-- No policies on purpose. Only the service role (which bypasses RLS) touches these,
-- from src/pages/api/subscribe.ts. anon and authenticated get nothing, read or write.
-- The Supabase linter reports this as rls_enabled_no_policy at INFO level; that is
-- the intended state here and matches public.waitlist in the same project.

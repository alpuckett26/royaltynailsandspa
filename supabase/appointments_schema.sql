-- ─────────────────────────────────────────────────────────────────────────────
-- Appointments
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists appointments (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  service          text not null,
  appointment_date date not null default current_date,
  appointment_time time,          -- optional, e.g. '14:30:00'
  notes            text,
  checked_in       boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table appointments enable row level security;

-- All access goes through API routes (service role) — no anon policies needed
create policy "service role all"
  on appointments for all
  using (true)
  with check (true);

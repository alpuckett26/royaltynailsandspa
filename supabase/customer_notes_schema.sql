-- ─────────────────────────────────────────────────────────────────────────────
-- Customer Notes
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists customer_notes (
  id             uuid primary key default gen_random_uuid(),
  customer_email text not null,
  note           text not null,
  created_by     text not null,  -- employee name
  created_at     timestamptz not null default now()
);

create index if not exists customer_notes_email_idx on customer_notes (customer_email);

alter table customer_notes enable row level security;

create policy "service role all"
  on customer_notes for all
  using (true)
  with check (true);

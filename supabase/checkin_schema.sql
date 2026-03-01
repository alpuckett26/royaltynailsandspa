-- ─────────────────────────────────────────────────────────────────────────────
-- Walk-In Check-In Queue
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists checkin_queue (
  id          uuid primary key default gen_random_uuid(),
  customer_name text not null,
  service     text not null,
  notes       text,
  status      text not null default 'waiting'
                check (status in ('waiting', 'served')),
  created_at  timestamptz not null default now(),
  served_at   timestamptz
);

-- ── Row-Level Security ────────────────────────────────────────────────────────

alter table checkin_queue enable row level security;

-- Anyone (kiosk, no auth) can insert a new check-in
create policy "public insert"
  on checkin_queue for insert
  to anon
  with check (true);

-- Service role (used by API routes) can read and update
create policy "service role select"
  on checkin_queue for select
  using (true);

create policy "service role update"
  on checkin_queue for update
  using (true);

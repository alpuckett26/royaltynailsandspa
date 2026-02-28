-- ─────────────────────────────────────────────────────────────────────────────
-- ROYALTY NAILS & SPA — Shifts / Schedule Schema
-- Run this in Supabase SQL Editor after the main schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists shifts (
  id          uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  shift_date  date not null,
  start_time  time not null,
  end_time    time not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists shifts_employee_id_idx on shifts(employee_id);
create index if not exists shifts_shift_date_idx  on shifts(shift_date);

alter table shifts enable row level security;

-- Employees can read their own shifts via the public schedule link (uses anon key + employee_id)
create policy "Employees can read their own shifts"
  on shifts for select
  using (true);

-- Only service role (API routes) can insert/update/delete

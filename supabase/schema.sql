-- ─────────────────────────────────────────────────────────────────────────────
-- ROYALTY NAILS & SPA — Supabase Database Schema
--
-- HOW TO USE:
-- 1. Go to https://supabase.com and create a free project
-- 2. Open the SQL Editor in your project dashboard
-- 3. Paste and run this entire file
-- 4. Copy your project URL and API keys into .env.local
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── EMPLOYEES ────────────────────────────────────────────────────────────────

create table if not exists employees (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  pin_hash   text not null,           -- bcrypt hash of the 4-digit PIN
  role       text not null default 'staff'
               check (role in ('staff', 'admin')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── TIME ENTRIES ──────────────────────────────────────────────────────────────

create table if not exists time_entries (
  id          uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  clock_in    timestamptz not null default now(),
  clock_out   timestamptz,            -- null = currently clocked in
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists time_entries_employee_id_idx on time_entries(employee_id);
create index if not exists time_entries_clock_in_idx    on time_entries(clock_in);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- The service role key (used in API routes) bypasses RLS automatically.
-- The anon key (used client-side) respects these policies.

alter table employees   enable row level security;
alter table time_entries enable row level security;

-- Allow anyone with the anon key to read employee names/IDs for the login list
-- (PIN hashes are never selected client-side)
create policy "Public can read active employee names"
  on employees for select
  using (active = true);

-- Time entries are only accessible via the service role key (API routes)
-- No anon policies needed for time_entries

-- ── INITIAL SETUP ─────────────────────────────────────────────────────────────
-- To add your first employees, use the /employee/admin page after deploying,
-- or run the following SQL with your real bcrypt-hashed PINs.
--
-- To generate a bcrypt hash for a PIN in Node.js:
--   node -e "const b=require('bcryptjs'); b.hash('1234',10).then(console.log)"
--
-- Example insert (replace the hash with your real bcrypt hash):
--
-- insert into employees (name, pin_hash, role) values
--   ('Owner', '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH', 'admin'),
--   ('Alex',  '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH', 'staff'),
--   ('Jordan','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH', 'staff');

-- Migration: add deposit fields to appointments
-- Run in Supabase SQL Editor if your appointments table already exists.

alter table appointments
  add column if not exists deposit_amount     integer,      -- in cents, e.g. 2500 = $25.00
  add column if not exists deposit_payment_id text;         -- Square payment ID

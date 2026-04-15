-- Migration: add customer_email and customer_phone to appointments
-- Run this in the Supabase SQL Editor if your appointments table already exists.

alter table appointments
  add column if not exists customer_email text,
  add column if not exists customer_phone text;

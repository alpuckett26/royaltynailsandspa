-- Migration: add served_by_name to checkin_queue
-- Run in Supabase SQL Editor

alter table checkin_queue
  add column if not exists served_by_name text;

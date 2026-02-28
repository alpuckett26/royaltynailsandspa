import { createClient } from '@supabase/supabase-js'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Employee = {
  id: string
  name: string
  role: 'staff' | 'admin'
  active: boolean
  created_at: string
}

export type EmployeeWithHash = Employee & {
  pin_hash: string
}

export type TimeEntry = {
  id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  notes: string | null
  created_at: string
}

export type TimeEntryWithEmployee = TimeEntry & {
  employees: { name: string }
}

// ── Client-side Supabase client ───────────────────────────────────────────────
// Uses the anon key — safe to expose. RLS policies protect data.

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

// ── Server-side Supabase client (API routes only) ─────────────────────────────
// Uses the service role key — bypasses RLS. NEVER import this in client components.

export function getSupabaseAdmin() {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Copy .env.local.example to .env.local and fill in your values.'
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

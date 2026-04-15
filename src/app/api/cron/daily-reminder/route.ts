import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendDailyReminder } from '@/lib/email'

// ── GET /api/cron/daily-reminder ──────────────────────────────────────────────
// Called by Vercel Cron at 8 AM US Central every morning.
// Sends a daily schedule email to the business.
export async function GET(req: NextRequest) {
  // Protect against non-Vercel callers
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date     = new Date().toISOString().split('T')[0]
  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('customer_name, customer_email, customer_phone, service, appointment_time, notes, checked_in')
      .eq('appointment_date', date)
      .eq('checked_in', false)
      .order('appointment_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    await sendDailyReminder(data ?? [], date)

    return NextResponse.json({ ok: true, count: data?.length ?? 0 })
  } catch (err) {
    console.error('[cron daily-reminder]', err)
    return NextResponse.json({ error: 'Failed to send daily reminder' }, { status: 500 })
  }
}

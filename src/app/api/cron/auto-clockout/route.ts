import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/cron/auto-clockout
// Runs at 7 PM Central (00:00 UTC) via Vercel Cron.
// Closes any time entries still open so hours don't pile up overnight.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: open, error: fetchErr } = await supabase
      .from('time_entries')
      .select('id')
      .is('clock_out', null)

    if (fetchErr) throw fetchErr
    if (!open?.length) return NextResponse.json({ closed: 0 })

    const now = new Date().toISOString()
    const { error: updateErr } = await supabase
      .from('time_entries')
      .update({ clock_out: now, notes: 'Auto clock-out at 7:00 PM' })
      .is('clock_out', null)

    if (updateErr) throw updateErr

    return NextResponse.json({ closed: open.length })
  } catch (err) {
    console.error('[cron/auto-clockout]', err)
    return NextResponse.json({ error: 'Failed to auto clock-out' }, { status: 500 })
  }
}

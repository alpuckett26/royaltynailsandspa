import { NextRequest, NextResponse } from 'next/server'

// ── GET /api/appointments/ical?name=&service=&date=&time=&id= ─────────────────
// Returns an .ics calendar file for a single appointment.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name    = searchParams.get('name')    ?? 'Customer'
  const service = searchParams.get('service') ?? 'Nail Service'
  const date    = searchParams.get('date')    ?? ''
  const time    = searchParams.get('time')    ?? ''
  const id      = searchParams.get('id')      ?? crypto.randomUUID()

  const location = '6909 Rowlett Road, Suite 102, Rowlett, Texas 75089'
  const summary  = `Royalty Nails & Spa — ${service}`
  const description = `Appointment for ${name}\\nService: ${service}\\nLocation: ${location}\\nPhone: (214) 501-4300`

  let dtStart: string
  let dtEnd: string

  if (date && time) {
    // e.g. date = "2024-07-15", time = "14:30" or "14:30:00"
    const [y, mo, d] = date.split('-')
    const [h, m]     = time.split(':')
    const pad = (n: string) => n.padStart(2, '0')
    dtStart = `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`
    // Assume 1-hour appointment
    const endH = String(Number(h) + 1).padStart(2, '0')
    dtEnd = `${y}${pad(mo)}${pad(d)}T${pad(endH)}${pad(m)}00`
  } else if (date) {
    // All-day event
    const [y, mo, d] = date.split('-')
    dtStart = `${y}${mo}${d}`
    dtEnd   = dtStart
  } else {
    // Fallback: today all-day
    const today = new Date().toISOString().split('T')[0]
    const [y, mo, d] = today.split('-')
    dtStart = `${y}${mo}${d}`
    dtEnd   = dtStart
  }

  const allDay = !time
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Royalty Nails & Spa//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@royaltynailsandspa.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}`     : `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="royalty-nails-appointment.ics"`,
    },
  })
}

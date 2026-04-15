import { Resend } from 'resend'

const BUSINESS_EMAIL = 'royaltynailsspa37@gmail.com'
const FROM_EMAIL     = process.env.RESEND_FROM_EMAIL ?? 'Royalty Nails & Spa <bookings@royaltynailsandspa.com>'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function fmt12h(t: string | null | undefined): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function fmtDate(d: string): string {
  // "2024-07-15" → "Monday, July 15, 2024"
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Booking confirmation to business ─────────────────────────────────────────
export async function sendBookingNotification(appt: {
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  service: string
  date: string
  time?: string | null
  notes?: string | null
}) {
  const resend = getResend()
  if (!resend) return

  const timeStr = appt.time ? fmt12h(appt.time) : 'Time not set'
  const dateStr = fmtDate(appt.date)

  const contactLine = [
    appt.customerEmail && `Email: ${appt.customerEmail}`,
    appt.customerPhone && `Phone: ${appt.customerPhone}`,
  ].filter(Boolean).join('<br/>')

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      BUSINESS_EMAIL,
    subject: `New Appointment — ${appt.customerName} on ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
        <h2 style="color:#b8972a;margin-bottom:4px">New Appointment Booked</h2>
        <p style="color:#666;margin-top:0">Royalty Nails &amp; Spa</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888;width:110px">Customer</td><td style="padding:6px 0;font-weight:600">${appt.customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Service</td><td style="padding:6px 0">${appt.service}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Date</td><td style="padding:6px 0">${dateStr}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Time</td><td style="padding:6px 0">${timeStr}</td></tr>
          ${contactLine ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top">Contact</td><td style="padding:6px 0">${contactLine}</td></tr>` : ''}
          ${appt.notes ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top">Notes</td><td style="padding:6px 0">${appt.notes}</td></tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <p style="color:#aaa;font-size:12px">6909 Rowlett Road, Suite 102, Rowlett, TX 75089 &middot; (214) 501-4300</p>
      </div>
    `,
  }).catch(err => console.error('[email booking notification]', err))
}

// ── Customer confirmation email ───────────────────────────────────────────────
export async function sendCustomerConfirmation(appt: {
  customerName: string
  customerEmail: string
  service: string
  date: string
  time?: string | null
  notes?: string | null
  appointmentId: string
}) {
  const resend = getResend()
  if (!resend) return

  const timeStr = appt.time ? fmt12h(appt.time) : ''
  const dateStr = fmtDate(appt.date)

  const icalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://royaltynailsandspa.com'}/api/appointments/ical?name=${encodeURIComponent(appt.customerName)}&service=${encodeURIComponent(appt.service)}&date=${appt.date}&time=${appt.time ?? ''}&id=${appt.appointmentId}`

  const googleUrl = buildGoogleCalendarUrl(appt)

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      appt.customerEmail,
    subject: `Your Appointment at Royalty Nails & Spa — ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
        <h2 style="color:#b8972a;margin-bottom:4px">Appointment Confirmed</h2>
        <p style="color:#666;margin-top:0">Hi ${appt.customerName}, we look forward to seeing you!</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888;width:80px">Service</td><td style="padding:6px 0;font-weight:600">${appt.service}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Date</td><td style="padding:6px 0">${dateStr}</td></tr>
          ${timeStr ? `<tr><td style="padding:6px 0;color:#888">Time</td><td style="padding:6px 0">${timeStr}</td></tr>` : ''}
          ${appt.notes ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top">Notes</td><td style="padding:6px 0">${appt.notes}</td></tr>` : ''}
        </table>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <p style="font-weight:600;margin-bottom:8px">Add to your calendar</p>
        <a href="${googleUrl}" style="display:inline-block;margin-right:12px;padding:8px 18px;background:#b8972a;color:#fff;text-decoration:none;border-radius:4px;font-size:13px">Google Calendar</a>
        <a href="${icalUrl}" style="display:inline-block;padding:8px 18px;background:#444;color:#fff;text-decoration:none;border-radius:4px;font-size:13px">Apple / Outlook (.ics)</a>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <p style="color:#666;font-size:13px">
          <strong>Royalty Nails &amp; Spa</strong><br/>
          6909 Rowlett Road, Suite 102, Rowlett, TX 75089<br/>
          (214) 501-4300
        </p>
      </div>
    `,
  }).catch(err => console.error('[email customer confirmation]', err))
}

// ── Daily reminder email to business ─────────────────────────────────────────
export async function sendDailyReminder(appointments: Array<{
  customer_name: string
  customer_email?: string | null
  customer_phone?: string | null
  service: string
  appointment_time?: string | null
  notes?: string | null
}>, date: string) {
  const resend = getResend()
  if (!resend) return

  const dateStr = fmtDate(date)
  const count   = appointments.length

  const rows = appointments.map(a => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#b8972a;font-weight:600;white-space:nowrap">${a.appointment_time ? fmt12h(a.appointment_time) : '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-weight:600">${a.customer_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#555">${a.service}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#888;font-size:12px">${[a.customer_phone, a.customer_email].filter(Boolean).join('<br/>') || '—'}</td>
    </tr>
  `).join('')

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      BUSINESS_EMAIL,
    subject: `Today's Schedule — ${count} Appointment${count !== 1 ? 's' : ''} — ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#222">
        <h2 style="color:#b8972a;margin-bottom:4px">Today's Appointment Schedule</h2>
        <p style="color:#666;margin-top:0">${dateStr} &middot; ${count} appointment${count !== 1 ? 's' : ''}</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        ${count === 0
          ? '<p style="color:#aaa">No appointments scheduled for today.</p>'
          : `<table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="background:#f9f9f9">
                  <th style="padding:8px 12px;text-align:left;color:#888;font-weight:500">Time</th>
                  <th style="padding:8px 12px;text-align:left;color:#888;font-weight:500">Customer</th>
                  <th style="padding:8px 12px;text-align:left;color:#888;font-weight:500">Service</th>
                  <th style="padding:8px 12px;text-align:left;color:#888;font-weight:500">Contact</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`
        }
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <p style="color:#aaa;font-size:12px">Royalty Nails &amp; Spa &middot; 6909 Rowlett Road, Suite 102, Rowlett, TX 75089</p>
      </div>
    `,
  }).catch(err => console.error('[email daily reminder]', err))
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function buildGoogleCalendarUrl(appt: {
  customerName: string
  service: string
  date: string
  time?: string | null
}) {
  const title    = encodeURIComponent(`Royalty Nails & Spa — ${appt.service}`)
  const details  = encodeURIComponent(`Appointment for ${appt.customerName}\nService: ${appt.service}\nPhone: (214) 501-4300`)
  const location = encodeURIComponent('6909 Rowlett Road, Suite 102, Rowlett, TX 75089')

  let dates: string
  if (appt.date && appt.time) {
    const [y, mo, d] = appt.date.split('-')
    const [h, m]     = appt.time.split(':')
    const pad = (n: string) => n.padStart(2, '0')
    const start = `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`
    const endH  = String(Number(h) + 1).padStart(2, '0')
    const end   = `${y}${pad(mo)}${pad(d)}T${pad(endH)}${pad(m)}00`
    dates = `${start}/${end}`
  } else if (appt.date) {
    const [y, mo, d] = appt.date.split('-')
    dates = `${y}${mo}${d}/${y}${mo}${d}`
  } else {
    dates = ''
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
}

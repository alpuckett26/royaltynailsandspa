import { NextRequest, NextResponse } from 'next/server'

const SQ_BASE = process.env.SQUARE_ENV === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com'

const DEPOSIT_CENTS = Number(process.env.DEPOSIT_AMOUNT_CENTS ?? '2500')
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://royaltynailsandspa.com'

// POST /api/book/link
// Creates a Square Payment Link and returns the checkout URL.
// Booking data is base64-encoded into the redirect URL so the success page
// can save the appointment after payment is confirmed by Square.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      service?: string
      date?: string
      time?: string
      notes?: string
    }

    const { customerName, customerEmail, customerPhone, service, date, time, notes } = body

    if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim() || !service?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Encode booking details for the redirect URL
    const bookingPayload = Buffer.from(JSON.stringify({
      customerName:  customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      service:       service.trim(),
      date:          date ?? new Date().toISOString().split('T')[0],
      time:          time ?? null,
      notes:         notes?.trim() ?? null,
    })).toString('base64url')

    const redirectUrl = `${SITE_URL}/book/success?data=${bookingPayload}`

    const sqRes = await fetch(`${SQ_BASE}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        quick_pay: {
          name:        `Booking Deposit — ${service.trim()}`,
          price_money: { amount: DEPOSIT_CENTS, currency: 'USD' },
          location_id: process.env.SQUARE_LOCATION_ID,
        },
        checkout_options: {
          redirect_url:             redirectUrl,
          ask_for_shipping_address: false,
        },
        payment_note: `Deposit — ${service.trim()} — ${customerName.trim()}`,
      }),
    })

    const sqData = await sqRes.json()

    if (!sqRes.ok) {
      const msg = sqData.errors?.[0]?.detail ?? 'Could not create payment link.'
      console.error('[book/link] Square error', sqData.errors)
      return NextResponse.json({ error: msg }, { status: 402 })
    }

    return NextResponse.json({ url: sqData.payment_link.url })
  } catch (err) {
    console.error('[book/link]', err)
    return NextResponse.json({ error: 'Failed to create payment link.' }, { status: 500 })
  }
}

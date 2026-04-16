import { NextResponse } from 'next/server'

const SQ_BASE = process.env.SQUARE_ENV === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com'

export async function GET() {
  const res = await fetch(`${SQ_BASE}/v2/locations`, {
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': '2024-01-18',
    },
  })
  const data = await res.json()
  return NextResponse.json(data)
}

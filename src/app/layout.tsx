import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

const siteUrl = 'https://royaltynailsandspa.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Royalty Nails & Spa | Luxury Nail Salon in Rowlett, TX',
    template: '%s | Royalty Nails & Spa',
  },
  description:
    'Rowlett\'s premier luxury nail salon and spa. Offering signature manicures, pedicures, acrylics, and advanced facials. Located at 6909 Rowlett Road, Suite 102.',
  keywords: [
    'nail salon Rowlett TX',
    'luxury nail spa',
    'manicure pedicure',
    'acrylic nails',
    'hydrafacial',
    'nail salon DFW',
    'Royalty Nails Spa',
    'gel nails Rowlett',
    'spa Rowlett Texas',
  ],
  authors: [{ name: 'Royalty Nails & Spa' }],
  creator: 'Royalty Nails & Spa',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Royalty Nails & Spa',
    title: 'Royalty Nails & Spa | Luxury Nail Salon in Rowlett, TX',
    description:
      'An elevated nail and spa experience in Rowlett, Texas. Signature manicures, pedicures, acrylics, facials, and more — crafted for those who demand the finest.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Royalty Nails & Spa — Luxury Nail Salon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royalty Nails & Spa | Luxury Nail Salon in Rowlett, TX',
    description:
      'An elevated nail and spa experience in Rowlett, Texas.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0F14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-charcoal text-offwhite antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { SignatureOfferings } from '@/components/home/SignatureOfferings'
import { PricingPreview } from '@/components/home/PricingPreview'
import { Specials } from '@/components/home/Specials'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { CTABand } from '@/components/home/CTABand'

export const metadata: Metadata = {
  title: 'Royalty Nails & Spa | Luxury Nail Salon in Rowlett, TX',
  description:
    "Rowlett's premier luxury nail salon. Signature manicures, pedicures, waxing, and advanced facials — crafted for those who demand the finest. Walk-ins welcome.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <SignatureOfferings />
      <PricingPreview />
      <Specials />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTABand />
    </>
  )
}

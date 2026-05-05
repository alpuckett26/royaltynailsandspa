import type { Metadata } from 'next'
import Link from 'next/link'
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

      {/* Concerns band */}
      <section className="bg-charcoal border-t border-border/30 py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-xl text-offwhite">Had an issue with your visit?</p>
            <p className="text-sm text-offwhite/40 font-sans mt-1">We take every concern seriously and will personally follow up.</p>
          </div>
          <Link
            href="/feedback"
            className="shrink-0 px-7 py-3 border border-gold/50 text-gold text-xs tracking-widest uppercase font-sans hover:bg-gold/10 transition-colors duration-200"
          >
            Share Your Concern
          </Link>
        </div>
      </section>

      <CTABand />
    </>
  )
}

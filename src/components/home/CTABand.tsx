'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { businessInfo } from '@/lib/content'

export function CTABand() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1520] via-[#0B0F14] to-[#12101a]" />

      {/* Gold accent orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(198,161,91,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Top/bottom gold lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-4">
            <span className="block h-px w-8 bg-gold/50" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-sans">
              Reserve Your Experience
            </span>
            <span className="block h-px w-8 bg-gold/50" />
          </div>

          {/* Headline */}
          <h2 className="font-serif font-light text-offwhite leading-tight text-balance"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            You Deserve to Feel{' '}
            <em className="not-italic text-gold">Extraordinary</em>
          </h2>

          {/* Subtext */}
          <p className="text-offwhite/50 text-base md:text-lg font-sans max-w-xl leading-relaxed">
            Book your appointment today and step into an elevated experience.
            Walk-ins are always welcome.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Button
              href={`tel:${businessInfo.phone}`}
              variant="primary"
              size="lg"
            >
              Call to Book
            </Button>
            <Button href="/packages" variant="gold-outline" size="lg">
              Browse Services
            </Button>
          </div>

          {/* Contact micro-info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-2 text-xs font-sans text-offwhite/30 tracking-widest uppercase">
            <a
              href={`tel:${businessInfo.phone}`}
              className="hover:text-offwhite/60 transition-colors duration-200"
            >
              {businessInfo.phone}
            </a>
            <span className="hidden sm:block text-offwhite/15">◆</span>
            <span>{businessInfo.hours.weekdays}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

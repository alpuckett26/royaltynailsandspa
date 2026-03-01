'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { BookNowButton } from '@/components/ui/BookNowButton'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Abstract gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute -top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(198,161,91,0.25) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.5 }}
          className="absolute -bottom-1/4 left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(198,161,91,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(247,243,238,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(247,243,238,0.8) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Gold accent lines */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
        className="absolute top-1/2 left-0 w-24 h-px bg-gradient-to-r from-transparent to-gold/30 origin-left"
      />
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
        className="absolute top-1/2 right-0 w-24 h-px bg-gradient-to-l from-transparent to-gold/30 origin-right"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <span className="relative inline-block">
            {/* Spotlight glow behind the text */}
            <span
              className="absolute inset-0 -inset-x-12 blur-2xl opacity-30 rounded-full"
              style={{ background: 'radial-gradient(ellipse at center, #C6A15B 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <span className="relative flex flex-col items-center sm:block">
              <span
                className="font-serif leading-none text-gold-shimmer block"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              >
                Royalty
              </span>
              <span
                className="font-serif leading-none text-gold-shimmer block"
                style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
              >
                Nails &amp; Spa
              </span>
            </span>
          </span>
          <div className="flex items-center gap-3">
            <span className="block h-px w-6 bg-gold/50" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold/70 font-sans">
              Rowlett, Texas
            </span>
            <span className="block h-px w-6 bg-gold/50" />
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif font-light text-offwhite leading-[1.05] text-balance"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          Where Luxury
          <br />
          <em className="not-italic text-gold-gradient bg-gold-gradient bg-clip-text text-transparent">
            Meets Artistry
          </em>
        </motion.h1>

        {/* Supporting line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-offwhite/60 text-lg md:text-xl font-sans font-light leading-relaxed max-w-2xl mx-auto"
        >
          An elevated nail and spa experience — tailored to you, executed to
          perfection. Discover our full collection of signature treatments.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <BookNowButton variant="primary" size="lg">
            Book Now
          </BookNowButton>
          <Button href="/packages" variant="secondary" size="lg">
            View Packages
          </Button>
        </motion.div>

        {/* Trust micro-line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-10 text-xs text-offwhite/30 font-sans tracking-widest uppercase"
        >
          Walk-ins welcome · Licensed & insured · Gift cards available
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-charcoal to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-offwhite/30 font-sans">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent"
        />
      </motion.div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

export function PackagesHero() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(198,161,91,0.4) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="block h-px w-8 bg-gold/60" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-sans">
                Complete Service Menu
              </span>
              <span className="block h-px w-8 bg-gold/60" />
            </div>
            <h1
              className="font-serif font-light text-offwhite leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Packages & Pricing
            </h1>
            <p className="mt-6 text-offwhite/55 font-sans text-lg max-w-xl mx-auto leading-relaxed">
              Every service, every tier — transparently presented. Choose the
              treatment that speaks to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category nav pills */}
      <nav
        aria-label="Service categories"
        className="sticky top-16 z-30 bg-charcoal/90 backdrop-blur-md border-b border-border/60 py-4"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max">
            {serviceCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-xs tracking-widest uppercase text-offwhite/40 hover:text-gold font-sans transition-colors duration-200 whitespace-nowrap pb-1 border-b border-transparent hover:border-gold/40"
              >
                {cat.name}
              </a>
            ))}
            <a
              href="#add-ons"
              className="text-xs tracking-widest uppercase text-offwhite/40 hover:text-gold font-sans transition-colors duration-200 whitespace-nowrap pb-1 border-b border-transparent hover:border-gold/40"
            >
              Add-Ons
            </a>
          </div>
        </div>
      </nav>
    </>
  )
}

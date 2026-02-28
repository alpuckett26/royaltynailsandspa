'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { BookNowButton } from '@/components/ui/BookNowButton'
import type { Package } from '@/lib/content'

type PackageCardProps = {
  pkg: Package
  categoryName: string
  delay?: number
}

export function PackageCard({ pkg, categoryName, delay = 0 }: PackageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
      className={clsx(
        'relative flex flex-col glass-card rounded-sm p-8 h-full transition-shadow duration-300',
        pkg.featured
          ? 'border border-gold/35 shadow-gold hover:shadow-gold-md'
          : 'border border-border hover-gold-border'
      )}
    >
      {/* Featured glow */}
      {pkg.featured && (
        <div
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(198,161,91,0.05) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Badge */}
      {pkg.badge && (
        <div className="absolute -top-3.5 left-6">
          <span
            className={clsx(
              'text-[9px] tracking-[0.2em] uppercase font-sans font-semibold px-3 py-1',
              pkg.featured
                ? 'bg-gold text-charcoal'
                : 'bg-charcoal border border-gold/40 text-gold'
            )}
          >
            {pkg.badge}
          </span>
        </div>
      )}

      {/* Category eyebrow */}
      <span className="text-[9px] tracking-[0.25em] uppercase text-gold/50 font-sans mb-4 block">
        {categoryName}
      </span>

      {/* Name & price */}
      <div className="mb-5">
        <h3 className="font-serif text-2xl text-offwhite leading-tight mb-3">
          {pkg.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-4xl text-gold">${pkg.price}</span>
          {pkg.priceNote && (
            <span className="text-xs text-offwhite/40 font-sans">
              {pkg.priceNote}
            </span>
          )}
        </div>
      </div>

      {/* Gold divider */}
      <div className="w-8 h-px bg-gold/30 mb-5" />

      {/* Description */}
      <p className="text-sm text-offwhite/55 leading-relaxed font-sans mb-6">
        {pkg.description}
      </p>

      {/* Includes */}
      <div className="flex-1 mb-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-offwhite/30 font-sans mb-3">
          Includes
        </p>
        <ul className="flex flex-col gap-2">
          {pkg.includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-offwhite/65 font-sans">
              <span className="text-gold/60 mt-0.5 shrink-0 text-xs">◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Best for */}
      <div className="border-t border-border/40 pt-5 mb-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-offwhite/25 font-sans mb-1.5">
          Best for
        </p>
        <p className="text-xs text-offwhite/55 font-sans italic">{pkg.bestFor}</p>
      </div>

      {/* CTA */}
      <BookNowButton
        variant={pkg.featured ? 'primary' : 'gold-outline'}
        size="sm"
        className="w-full"
      >
        Book This Service
      </BookNowButton>
    </motion.div>
  )
}

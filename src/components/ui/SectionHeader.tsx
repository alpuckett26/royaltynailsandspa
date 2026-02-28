'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={clsx(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-3">
          {align !== 'center' && (
            <span className="block h-px w-8 bg-gold" />
          )}
          <span
            className={clsx(
              'text-xs tracking-[0.25em] uppercase font-sans font-medium',
              light ? 'text-charcoal/60' : 'text-gold'
            )}
          >
            {eyebrow}
          </span>
          {align === 'center' && (
            <>
              <span className="block h-px w-8 bg-gold/40 hidden sm:block" />
            </>
          )}
        </div>
      )}

      <h2
        className={clsx(
          'font-serif font-light leading-tight',
          'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
          light ? 'text-charcoal' : 'text-offwhite'
        )}
      >
        {title}
      </h2>

      {align === 'center' && (
        <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      )}

      {description && (
        <p
          className={clsx(
            'text-base md:text-lg leading-relaxed max-w-2xl',
            light ? 'text-charcoal/70' : 'text-offwhite/60'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}

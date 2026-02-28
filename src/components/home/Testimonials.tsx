'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { testimonials } from '@/lib/content'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? 'text-gold' : 'text-border'}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Client Stories"
          title="What Our Guests Say"
          description="The truest reflection of our craft is in the words of those who experience it."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="glass-card hover-gold-border rounded-sm p-8 flex flex-col gap-6 h-full"
              >
                {/* Quote mark */}
                <span className="font-serif text-5xl text-gold/20 leading-none select-none">
                  &ldquo;
                </span>

                {/* Stars */}
                <StarRating rating={t.rating} />

                {/* Text */}
                <p className="text-offwhite/65 text-sm leading-relaxed font-sans flex-1 -mt-2">
                  {t.text}
                </p>

                {/* Author */}
                <div className="border-t border-border/40 pt-5">
                  <p className="font-serif text-offwhite text-base">{t.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mt-1">
                    {t.location}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="h-px w-12 bg-gold/20" />
          <p className="text-xs text-offwhite/30 font-sans tracking-widest uppercase">
            100+ Five-Star Reviews on Google
          </p>
          <div className="h-px w-12 bg-gold/20" />
        </motion.div>
      </div>
    </section>
  )
}

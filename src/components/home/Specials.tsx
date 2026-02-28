'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { Button } from '@/components/ui/Button'
import { specials } from '@/lib/content'

export function Specials() {
  if (!specials || specials.length === 0) return null

  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Current Promotions"
          title="Specials & Offers"
          description="Limited-time promotions and ongoing offers — curated to make your next visit even more exceptional."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specials.map((special, i) => (
            <StaggerItem key={special.id}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative flex flex-col h-full glass-card hover-gold-border rounded-sm overflow-hidden"
              >
                {/* Top gold accent line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                <div className="flex flex-col gap-5 p-8 flex-1">
                  {/* Badge + eyebrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] tracking-[0.28em] uppercase text-gold/60 font-sans">
                      {special.eyebrow}
                    </span>
                    {special.badge && (
                      <span className="bg-gold/10 border border-gold/25 text-gold text-[9px] tracking-[0.18em] uppercase font-sans px-2.5 py-1">
                        {special.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl text-offwhite leading-tight">
                    {special.title}
                  </h3>

                  {/* Gold divider */}
                  <div className="w-8 h-px bg-gold/30" />

                  {/* Description */}
                  <p className="text-sm text-offwhite/55 leading-relaxed font-sans flex-1">
                    {special.description}
                  </p>

                  {/* Highlight box */}
                  <div className="bg-gold/5 border border-gold/15 rounded-sm p-4">
                    <p className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-1.5">
                      The offer
                    </p>
                    <p className="text-sm text-gold font-sans font-medium">
                      {special.highlight}
                    </p>
                  </div>

                  {/* Valid through */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-offwhite/25 font-sans mb-0.5">
                        Valid through
                      </p>
                      <p className="text-xs text-offwhite/50 font-sans">
                        {special.validThrough}
                      </p>
                    </div>
                    <span className="text-gold/30 text-xs font-sans">◆</span>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <p className="text-offwhite/40 text-xs font-sans tracking-wide">
            Mention the offer when booking. Cannot be combined with other promotions.
          </p>
          <Button href="tel:(214) 501-4300" variant="ghost" size="sm">
            Call to Redeem →
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

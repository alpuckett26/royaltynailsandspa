'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { addOns } from '@/lib/content'

export function AddOns() {
  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Enhancements"
          title="Add-On Services"
          description="Elevate any treatment with our carefully curated add-ons, available with any service."
          className="mb-16"
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {addOns.map((addon, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="glass-card hover-gold-border rounded-sm p-6 flex items-start gap-4"
              >
                {/* Gold dot */}
                <span className="text-gold/40 mt-1 shrink-0">◆</span>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif text-offwhite text-base leading-tight">
                      {addon.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="text-gold font-serif text-lg leading-none">
                        +${addon.price}
                      </span>
                      {addon.priceNote && (
                        <span className="text-[10px] text-offwhite/30 font-sans block">
                          {addon.priceNote}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-offwhite/45 font-sans leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-xs text-offwhite/30 font-sans"
        >
          Ask your technician about any add-on before your service begins.
        </motion.p>
      </div>
    </section>
  )
}

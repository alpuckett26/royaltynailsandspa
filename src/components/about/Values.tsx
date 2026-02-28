'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { brandValues } from '@/lib/content'

export function Values() {
  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Our Philosophy"
          title="The Pillars of Our Craft"
          description="Every decision we make — from product selection to team training — is guided by four unwavering principles."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandValues.map((value, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="glass-card hover-gold-border rounded-sm p-8 flex flex-col gap-5 h-full"
              >
                {/* Number */}
                <span className="font-serif text-5xl text-gold/10 leading-none select-none">
                  0{i + 1}
                </span>

                {/* Title */}
                <h3 className="font-serif text-xl text-offwhite">{value.title}</h3>

                {/* Gold divider */}
                <div className="w-6 h-px bg-gold/40" />

                {/* Description */}
                <p className="text-sm text-offwhite/50 leading-relaxed font-sans">
                  {value.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Team note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#111820] to-[#0d1219] rounded-sm" />
          <div
            className="absolute inset-0 rounded-sm pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, rgba(198,161,91,0.06) 0%, transparent 60%)',
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

          <div className="relative z-10 p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-sans mb-4">
                Our Approach
              </p>
              <h3 className="font-serif text-2xl md:text-3xl text-offwhite leading-tight">
                Precision in every detail.{' '}
                <em className="not-italic text-gold">Warmth in every interaction.</em>
              </h3>
            </div>
            <div>
              <p className="text-offwhite/55 text-sm leading-relaxed font-sans">
                Our technicians undergo continuous training to stay at the
                forefront of nail artistry and skincare. We believe that
                expertise, paired with genuine care for each client, is the
                foundation of an exceptional experience. When you sit in our
                chair, you are our complete focus.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { howItWorks } from '@/lib/content'

export function HowItWorks() {
  return (
    <section className="section-padding border-y border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="The Process"
          title="How It Works"
          description="From reservation to the final reveal — a seamless, unhurried experience designed entirely around you."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent z-0" />

          {howItWorks.map((step, i) => (
            <StaggerItem key={step.step}>
              <div className="relative flex flex-col items-center text-center px-8 py-4 group">
                {/* Step number */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 w-20 h-20 rounded-full border border-gold/25 flex items-center justify-center mb-8 bg-charcoal group-hover:border-gold/50 transition-colors duration-300"
                >
                  <span className="font-serif text-3xl text-gold/70 group-hover:text-gold transition-colors duration-300">
                    {step.step}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-xl text-offwhite">{step.title}</h3>
                  <p className="text-sm text-offwhite/50 leading-relaxed font-sans max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (mobile only) */}
                {i < howItWorks.length - 1 && (
                  <div className="md:hidden mt-8 mb-4">
                    <span className="text-gold/30 text-2xl">↓</span>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { signatureOfferings } from '@/lib/content'

export function SignatureOfferings() {
  return (
    <section className="section-padding max-w-7xl mx-auto px-6 lg:px-12">
      <SectionHeader
        eyebrow="Our Specialties"
        title="Signature Offerings"
        description="Every treatment in our collection is a carefully composed experience — not simply a service, but a ritual."
        className="mb-16 md:mb-20"
      />

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {signatureOfferings.map((offering) => (
          <StaggerItem key={offering.id}>
            <Link href={offering.link} className="group block h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full glass-card hover-gold-border rounded-sm p-8 flex flex-col gap-6 cursor-pointer"
              >
                {/* Icon */}
                <span className="text-gold text-2xl font-serif leading-none group-hover:scale-110 transition-transform duration-300 inline-block">
                  {offering.icon}
                </span>

                {/* Text */}
                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="font-serif text-xl text-offwhite leading-tight group-hover:text-gold transition-colors duration-300">
                    {offering.title}
                  </h3>
                  <p className="text-sm text-offwhite/50 leading-relaxed font-sans">
                    {offering.description}
                  </p>
                </div>

                {/* Price + arrow */}
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="text-gold text-sm font-sans">
                    {offering.priceFrom}
                  </span>
                  <span className="text-offwhite/30 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 text-sm">
                    →
                  </span>
                </div>
              </motion.div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}

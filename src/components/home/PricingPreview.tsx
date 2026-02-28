'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { Button } from '@/components/ui/Button'
import { serviceCategories } from '@/lib/content'

// Featured packages for the preview (one per main category)
const featuredPackages = [
  {
    categoryId: 'manicures',
    packageName: 'Royal Manicure',
    badge: 'Most Popular',
  },
  {
    categoryId: 'pedicures',
    packageName: 'Gold Pedicure',
    badge: 'Luxury',
  },
  {
    categoryId: 'combinations',
    packageName: 'Signature Pedicure & Manicure',
    badge: 'Best Value',
  },
  {
    categoryId: 'facials',
    packageName: 'Hydrafacial',
    badge: 'Advanced',
  },
]

export function PricingPreview() {
  const packages = featuredPackages
    .map(({ categoryId, packageName }) => {
      const category = serviceCategories.find((c) => c.id === categoryId)
      const pkg = category?.packages.find((p) => p.name === packageName)
      return pkg ? { ...pkg, categoryId, categoryName: category?.name } : null
    })
    .filter(Boolean)

  return (
    <section className="section-padding bg-gradient-to-b from-charcoal via-charcoal/95 to-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Featured Packages"
          title="Curated for the Discerning"
          description="A selection of our most sought-after treatments. View the complete menu for all tiers and options."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => {
            if (!pkg) return null
            return (
              <StaggerItem key={pkg.name}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`relative h-full glass-card hover-gold-border rounded-sm p-7 flex flex-col gap-5 ${
                    pkg.featured
                      ? 'border-gold/30 shadow-gold'
                      : 'border-border'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-gold text-charcoal text-[9px] tracking-[0.2em] uppercase font-sans font-semibold px-3 py-1">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  <span className="text-[9px] tracking-[0.25em] uppercase text-gold/60 font-sans">
                    {pkg.categoryName}
                  </span>

                  {/* Name + price */}
                  <div>
                    <h3 className="font-serif text-xl text-offwhite leading-tight mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl text-gold">${pkg.price}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-8 h-px bg-gold/30" />

                  {/* Description */}
                  <p className="text-sm text-offwhite/50 leading-relaxed font-sans flex-1">
                    {pkg.description}
                  </p>

                  {/* Best for */}
                  <div className="pt-4 border-t border-border/40">
                    <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-1">
                      Best for
                    </p>
                    <p className="text-xs text-offwhite/60 font-sans">{pkg.bestFor}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button href="/packages" variant="primary" size="lg">
            View All Packages
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Ask a Question
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

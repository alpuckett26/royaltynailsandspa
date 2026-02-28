import type { Metadata } from 'next'
import { serviceCategories } from '@/lib/content'
import { PackageCard } from '@/components/packages/PackageCard'
import { ComparisonGrid } from '@/components/packages/ComparisonGrid'
import { AddOns } from '@/components/packages/AddOns'
import { CTABand } from '@/components/home/CTABand'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PackagesHero } from '@/components/packages/PackagesHero'

export const metadata: Metadata = {
  title: 'Packages & Pricing',
  description:
    'Browse the complete Royalty Nails & Spa service menu — manicures from $22, pedicures from $25, signature combinations, acrylics, and advanced facials.',
}

export default function PackagesPage() {
  return (
    <>
      {/* Page Hero + sticky category nav */}
      <PackagesHero />

      {/* Service Categories */}
      {serviceCategories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="section-padding border-t border-border/40 scroll-mt-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <SectionHeader
              eyebrow={category.eyebrow}
              title={category.name}
              description={category.description}
              align="left"
              className="mb-12 md:mb-16"
            />

            <div
              className={`grid gap-6 ${
                category.packages.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
                  : category.packages.length === 3
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : category.packages.length === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {category.packages.map((pkg, pkgIndex) => (
                <PackageCard
                  key={pkg.name}
                  pkg={pkg}
                  categoryName={category.name}
                  delay={pkgIndex * 0.08}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Comparison Grid */}
      <ComparisonGrid />

      {/* Add-Ons */}
      <div id="add-ons" className="scroll-mt-28">
        <AddOns />
      </div>

      {/* CTA Band */}
      <CTABand />
    </>
  )
}

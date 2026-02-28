'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { comparisonFeatures } from '@/lib/content'

const tiers = [
  { key: 'basic', label: 'Basic', price: 'From $22', color: 'text-offwhite/60' },
  { key: 'deluxe', label: 'Deluxe', price: 'From $45', color: 'text-offwhite/80' },
  { key: 'royal', label: 'Royal', price: 'From $50', color: 'text-gold' },
  { key: 'exotic', label: 'Exotic', price: 'From $67', color: 'text-gold-light' },
]

function Check({ included }: { included: boolean }) {
  return included ? (
    <span className="text-gold text-sm" aria-label="Included">✓</span>
  ) : (
    <span className="text-border/60 text-sm" aria-label="Not included">–</span>
  )
}

export function ComparisonGrid() {
  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeader
          eyebrow="Compare"
          title="Service Tier Comparison"
          description="Find the tier that perfectly matches your needs and budget."
          className="mb-16"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[600px]" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-5 pr-8 text-xs tracking-widest uppercase text-offwhite/30 font-sans font-normal w-2/5">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th key={tier.key} className="py-5 px-4 text-center" scope="col">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-serif text-lg ${tier.color}`}>
                        {tier.label}
                      </span>
                      <span className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">
                        {tier.price}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/30 hover:bg-offwhite/[0.02] transition-colors duration-200"
                >
                  <td className="py-4 pr-8 text-sm text-offwhite/60 font-sans">
                    {row.feature}
                  </td>
                  {tiers.map((tier) => (
                    <td key={tier.key} className="py-4 px-4 text-center">
                      <Check included={row[tier.key as keyof typeof row] as boolean} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-6 text-xs text-offwhite/30 font-sans text-center">
          Feature availability varies by specific service. Ask your technician for details.
        </p>
      </div>
    </section>
  )
}

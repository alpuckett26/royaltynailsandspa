'use client'

import { motion } from 'framer-motion'
import { trustCues } from '@/lib/content'

export function TrustStrip() {
  return (
    <section className="border-y border-border/60 bg-charcoal/50 py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {trustCues.map((cue, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-xs tracking-[0.2em] uppercase text-offwhite/50 font-sans whitespace-nowrap hover:text-offwhite/80 transition-colors duration-300 cursor-default">
                {cue}
              </span>
              {i < trustCues.length - 1 && (
                <span className="text-gold/30 select-none hidden sm:block">◆</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

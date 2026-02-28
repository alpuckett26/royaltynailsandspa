'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { businessInfo } from '@/lib/content'

export function BrandStory() {
  return (
    <section className="section-padding pt-36 md:pt-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Visual element */}
          <AnimatedSection animation="slide-right">
            <div className="relative">
              {/* Decorative frame */}
              <div className="relative aspect-[4/5] bg-card-gradient border border-border rounded-sm overflow-hidden">
                {/* Abstract gradient art */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 20%, rgba(198,161,91,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(198,161,91,0.08) 0%, transparent 50%), linear-gradient(135deg, #0d1219 0%, #151c28 100%)',
                  }}
                />
                {/* Fine line grid */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(198,161,91,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,161,91,1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Center text art */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-8">
                  <span className="font-serif text-7xl text-gold/10 leading-none select-none">R</span>
                  <span className="text-[9px] tracking-[0.4em] uppercase text-gold/30 font-sans">
                    Est. Rowlett, Texas
                  </span>
                </div>
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/30" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/30" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/30" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/30" />
              </div>

              {/* Floating stat */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-8 -right-6 glass-card border border-gold/20 p-6 rounded-sm"
              >
                <p className="font-serif text-3xl text-gold leading-none mb-1">100+</p>
                <p className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                  Five-Star Reviews
                </p>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right: Story text */}
          <AnimatedSection animation="slide-left" delay={0.2}>
            <div className="flex flex-col gap-8">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="block h-px w-8 bg-gold" />
                <span className="text-xs tracking-[0.25em] uppercase text-gold font-sans">
                  Our Story
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif font-light text-offwhite leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                More Than a Nail Salon —<br />
                <em className="not-italic text-gold">A True Sanctuary</em>
              </h1>

              {/* Body */}
              <div className="flex flex-col gap-5 text-offwhite/60 text-base leading-relaxed font-sans">
                <p>
                  Royalty Nails & Spa was founded on a singular belief: that
                  everyone deserves to be treated with the care and attention
                  typically reserved for royalty. Located in the heart of
                  Rowlett, Texas, we set out to create a space where artistry,
                  cleanliness, and genuine hospitality converge.
                </p>
                <p>
                  Our skilled team of licensed nail artists and estheticians
                  brings together years of expertise and a shared passion for
                  their craft. We invest in ongoing education, premium
                  products, and rigorous hygiene standards — because the
                  details are everything.
                </p>
                <p>
                  From your first visit, you&apos;ll notice the difference. The
                  attentive consultation. The unhurried pace. The results that
                  exceed your expectations. This is {businessInfo.name}.
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/40">
                {[
                  { value: '5+', label: 'Years Serving DFW' },
                  { value: '20+', label: 'Signature Services' },
                  { value: '100%', label: 'Client Satisfaction' },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="font-serif text-2xl text-gold">{stat.value}</span>
                    <span className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

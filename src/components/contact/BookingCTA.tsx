'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { businessInfo } from '@/lib/content'

export function BookingCTA() {
  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phone booking card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card border border-gold/20 rounded-sm p-10 overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 20% 50%, rgba(198,161,91,0.06) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10 flex flex-col gap-5">
              <span className="text-[9px] tracking-[0.3em] uppercase text-gold/60 font-sans">
                By Phone
              </span>
              <h3 className="font-serif text-2xl text-offwhite leading-tight">
                Call to Book<br />Your Appointment
              </h3>
              <p className="text-sm text-offwhite/50 font-sans leading-relaxed max-w-sm">
                Speak directly with our team to schedule your preferred service,
                ask questions, or arrange a group booking.
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="font-serif text-3xl text-gold hover:text-gold-light transition-colors duration-300"
                >
                  {businessInfo.phone}
                </a>
                <p className="text-xs text-offwhite/30 font-sans mt-2">
                  {businessInfo.hours.weekdays}
                </p>
              </div>
              <Button
                href={`tel:${businessInfo.phone}`}
                variant="primary"
                size="md"
                className="self-start mt-2"
              >
                Call Now
              </Button>
            </div>
          </motion.div>

          {/* Online booking card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative glass-card border border-gold/30 rounded-sm p-10 overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 80% 20%, rgba(198,161,91,0.08) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10 flex flex-col gap-5">
              <span className="text-[9px] tracking-[0.3em] uppercase text-gold/60 font-sans">
                Online — Powered by Booksy
              </span>
              <h3 className="font-serif text-2xl text-offwhite leading-tight">
                Book Online<br />Anytime
              </h3>
              <p className="text-sm text-offwhite/50 font-sans leading-relaxed max-w-sm">
                Select your service, choose a time, and confirm your appointment
                instantly — 24/7, no phone call required.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-offwhite/40 font-sans">
                <li className="flex items-center gap-2"><span className="text-gold/60">◆</span> Real-time availability</li>
                <li className="flex items-center gap-2"><span className="text-gold/60">◆</span> Instant confirmation</li>
                <li className="flex items-center gap-2"><span className="text-gold/60">◆</span> Appointment reminders</li>
              </ul>
              <BookNowButton variant="primary" size="md" className="self-start mt-2">
                Book Online
              </BookNowButton>
            </div>
          </motion.div>

          {/* Walk-in / Map card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative glass-card border border-border rounded-sm p-10 overflow-hidden"
          >
            <div className="relative z-10 flex flex-col gap-5">
              <span className="text-[9px] tracking-[0.3em] uppercase text-gold/60 font-sans">
                Walk In
              </span>
              <h3 className="font-serif text-2xl text-offwhite leading-tight">
                Visit Us in<br />Rowlett
              </h3>
              <p className="text-sm text-offwhite/50 font-sans leading-relaxed max-w-sm">
                Walk-ins are always welcome based on availability. Come in,
                unwind, and let us take care of the rest.
              </p>
              <address className="not-italic text-sm text-offwhite/70 font-sans leading-relaxed">
                {businessInfo.address}
              </address>

              {/* Placeholder map area */}
              <div className="w-full h-32 bg-charcoal border border-border/60 rounded-sm flex items-center justify-center mt-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200 flex items-center gap-2"
                >
                  <span>◆</span>
                  <span>Open in Google Maps</span>
                </a>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
                <p className="text-xs text-offwhite/40 font-sans">{businessInfo.hours.weekdays}</p>
                <p className="text-xs text-offwhite/40 font-sans">{businessInfo.hours.weekends}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

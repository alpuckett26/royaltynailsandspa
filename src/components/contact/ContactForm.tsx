'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { businessInfo } from '@/lib/content'

type FormState = {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

const serviceOptions = [
  'Manicure',
  'Pedicure',
  'Signature Combination',
  'Acrylic Services',
  'Facial Services',
  'Add-On / Enhancement',
  'General Inquiry',
  'Gift Card',
]

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mailto fallback
    const subject = `Inquiry from ${form.name} — ${form.service || 'General'}`
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nService Interest: ${form.service}\n\nMessage:\n${form.message}`
    window.location.href = `mailto:${businessInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  const inputClass =
    'w-full bg-charcoal border border-border rounded-sm px-5 py-3.5 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-200'

  return (
    <section className="section-padding pt-36 md:pt-44">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-10"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="block h-px w-8 bg-gold" />
                <span className="text-xs tracking-[0.25em] uppercase text-gold font-sans">
                  Get in Touch
                </span>
              </div>
              <h1 className="font-serif font-light text-offwhite leading-tight mb-4"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Let&apos;s Plan Your{' '}
                <em className="not-italic text-gold">Experience</em>
              </h1>
              <p className="text-offwhite/55 text-base font-sans leading-relaxed">
                Whether you&apos;re ready to book, have questions about a
                service, or want to arrange a gift — we&apos;re here and happy
                to help.
              </p>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-6">
              {[
                {
                  label: 'Phone',
                  value: businessInfo.phone,
                  href: `tel:${businessInfo.phone}`,
                },
                {
                  label: 'Email',
                  value: businessInfo.email,
                  href: `mailto:${businessInfo.email}`,
                },
                {
                  label: 'Address',
                  value: businessInfo.address,
                  href: `https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">
                    {item.label}
                  </p>
                  <a
                    href={item.href}
                    target={item.label === 'Address' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="text-offwhite/75 hover:text-offwhite text-sm font-sans transition-colors duration-200"
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="glass-card border border-border rounded-sm p-7">
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold/60 font-sans mb-4">
                Hours
              </p>
              <div className="flex flex-col gap-2 text-sm font-sans text-offwhite/65">
                <p>{businessInfo.hours.weekdays}</p>
                <p>{businessInfo.hours.weekends}</p>
              </div>
            </div>

            {/* Booking note */}
            <div className="flex flex-col gap-4 pt-2 border-t border-border/40">
              <p className="text-sm text-offwhite/40 font-sans leading-relaxed">
                Prefer to call directly? Our team is available during business
                hours to assist with bookings and any questions.
              </p>
              <Button
                href={`tel:${businessInfo.phone}`}
                variant="primary"
                size="md"
                className="self-start"
              >
                Call to Book
              </Button>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {submitted ? (
              <div className="glass-card border border-gold/25 rounded-sm p-12 flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
                <span className="text-gold text-4xl">✓</span>
                <h3 className="font-serif text-2xl text-offwhite">
                  Message Sent
                </h3>
                <p className="text-offwhite/50 text-sm font-sans max-w-xs leading-relaxed">
                  Your email client should have opened. We&apos;ll respond as
                  soon as possible. Alternatively, call us directly at{' '}
                  <a
                    href={`tel:${businessInfo.phone}`}
                    className="text-gold hover:underline"
                  >
                    {businessInfo.phone}
                  </a>
                  .
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="gold-outline"
                  size="sm"
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-card border border-border rounded-sm p-8 md:p-10 flex flex-col gap-6"
              >
                <h2 className="font-serif text-xl text-offwhite">
                  Send a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                      Full Name <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(214) 000-0000"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                    Email Address <span className="text-gold">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                    Service Interest
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select a service...</option>
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">
                    Message <span className="text-gold">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full mt-2">
                  Send Message
                </Button>

                <p className="text-[10px] text-offwhite/25 font-sans text-center">
                  This form opens your default email client. Alternatively,
                  call us at {businessInfo.phone}.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

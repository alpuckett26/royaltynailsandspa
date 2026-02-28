'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { faqs } from '@/lib/content'

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border-b border-border/60 last:border-0"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left py-6 flex items-start justify-between gap-6 group"
      >
        <span
          className={`font-serif text-lg leading-snug transition-colors duration-300 ${
            isOpen ? 'text-gold' : 'text-offwhite group-hover:text-offwhite/80'
          }`}
        >
          {question}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={`shrink-0 mt-1 text-xl leading-none transition-colors duration-300 ${
            isOpen ? 'text-gold' : 'text-offwhite/30 group-hover:text-offwhite/50'
          }`}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-offwhite/55 text-sm leading-relaxed font-sans max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i))
  }

  return (
    <section className="section-padding border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Header */}
          <div className="lg:col-span-1">
            <AnimatedSection animation="slide-right">
              <SectionHeader
                eyebrow="Questions"
                title="Frequently Asked"
                align="left"
              />
              <p className="mt-6 text-offwhite/50 text-sm leading-relaxed font-sans max-w-xs">
                Everything you need to know before your visit. Still have
                questions? We&apos;re happy to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 mt-8 text-xs tracking-widest uppercase text-gold hover:text-gold-light font-sans transition-colors duration-200"
              >
                <span>Get in Touch</span>
                <span>→</span>
              </a>
            </AnimatedSection>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-2">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                index={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { businessInfo } from '@/lib/content'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-charcoal/95 backdrop-blur-md border-b border-border/60 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo — tagline only, name lives in the hero */}
          <Link href="/" className="group flex flex-col items-start gap-0.5">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold/70 font-sans group-hover:text-gold transition-colors duration-300">
              {businessInfo.tagline}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'text-xs tracking-widest uppercase font-sans transition-colors duration-300',
                  pathname === link.href
                    ? 'text-gold'
                    : 'text-offwhite/70 hover:text-offwhite'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Button
              href={`tel:${businessInfo.phone}`}
              variant="secondary"
              size="sm"
              className="hidden md:inline-flex"
            >
              Call
            </Button>
            <BookNowButton variant="primary" size="sm" className="hidden sm:inline-flex">
              Book Now
            </BookNowButton>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className="lg:hidden flex flex-col items-center justify-center w-9 h-9 gap-1.5 group"
            >
              <span
                className={clsx(
                  'block w-6 h-px bg-offwhite/80 transition-all duration-300',
                  mobileOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={clsx(
                  'block w-6 h-px bg-offwhite/80 transition-all duration-300',
                  mobileOpen && 'opacity-0'
                )}
              />
              <span
                className={clsx(
                  'block w-6 h-px bg-offwhite/80 transition-all duration-300',
                  mobileOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-0 top-0 z-40 bg-charcoal/98 backdrop-blur-xl border-b border-border pt-24 pb-8 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className={clsx(
                      'block py-4 text-sm tracking-widest uppercase font-sans border-b border-border/40 transition-colors duration-200',
                      pathname === link.href
                        ? 'text-gold'
                        : 'text-offwhite/70 hover:text-offwhite'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col gap-3"
              >
                <BookNowButton variant="primary" size="lg" className="w-full">
                  Book Now
                </BookNowButton>
                <Button
                  href={`tel:${businessInfo.phone}`}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Call {businessInfo.phone}
                </Button>
              </motion.div>
              <p className="mt-4 text-center text-xs text-offwhite/40 font-sans tracking-widest">
                {businessInfo.phone}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

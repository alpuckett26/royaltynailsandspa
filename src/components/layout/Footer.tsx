import Link from 'next/link'
import { businessInfo } from '@/lib/content'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const serviceLinks = [
  { label: 'Manicures', href: '/packages#manicures' },
  { label: 'Pedicures', href: '/packages#pedicures' },
  { label: 'Combinations', href: '/packages#combinations' },
  { label: 'Acrylics', href: '/packages#acrylics' },
  { label: 'Facials', href: '/packages#facials' },
]

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-border/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="group inline-block mb-4">
              <span className="font-serif text-2xl text-offwhite group-hover:text-gold transition-colors duration-300 leading-none block">
                {businessInfo.name}
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold/60 font-sans block mt-1">
                {businessInfo.tagline}
              </span>
            </Link>
            <p className="text-offwhite/50 text-sm leading-relaxed font-sans mt-4 max-w-xs">
              Rowlett&apos;s premier nail salon — where every visit is an
              elevated experience.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={businessInfo.social.instagram}
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm text-offwhite/40 hover:text-gold hover:border-gold/40 transition-all duration-300 text-xs"
              >
                IG
              </a>
              <a
                href={businessInfo.social.facebook}
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm text-offwhite/40 hover:text-gold hover:border-gold/40 transition-all duration-300 text-xs"
              >
                FB
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-gold/70 font-sans mb-5">
              Navigate
            </h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-offwhite/50 hover:text-offwhite text-sm font-sans transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-gold/70 font-sans mb-5">
              Services
            </h3>
            <ul className="flex flex-col gap-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-offwhite/50 hover:text-offwhite text-sm font-sans transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-gold/70 font-sans mb-5">
              Visit Us
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <p className="text-offwhite/40 text-xs uppercase tracking-widest font-sans mb-1">
                  Address
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-offwhite/70 hover:text-offwhite text-sm font-sans transition-colors duration-200 leading-relaxed block"
                >
                  {businessInfo.address}
                </a>
              </li>
              <li>
                <p className="text-offwhite/40 text-xs uppercase tracking-widest font-sans mb-1">
                  Hours
                </p>
                <p className="text-offwhite/70 text-sm font-sans leading-relaxed">
                  {businessInfo.hours.weekdays}
                  <br />
                  {businessInfo.hours.weekends}
                </p>
              </li>
              <li>
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="text-gold hover:text-gold-light text-sm font-sans transition-colors duration-200"
                >
                  {businessInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Gold divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-offwhite/30 text-xs font-sans tracking-wide">
            © {new Date().getFullYear()} {businessInfo.name}. All rights reserved.
          </p>
          <p className="text-offwhite/20 text-xs font-sans">
            Rowlett, Texas
          </p>
        </div>
      </div>
    </footer>
  )
}

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
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm text-offwhite/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
              >
                {/* Instagram icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href={businessInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm text-offwhite/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
              >
                {/* Facebook icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
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
          <div className="flex items-center gap-6">
            <p className="text-offwhite/20 text-xs font-sans">
              Rowlett, Texas
            </p>
            <Link
              href="/employee"
              className="text-offwhite/15 hover:text-offwhite/40 text-xs font-sans transition-colors duration-300"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Staff Portal | Royalty Nails & Spa',
  robots: { index: false, follow: false },
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Slim portal header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-serif text-lg text-offwhite/60 group-hover:text-offwhite transition-colors duration-200">
            Royalty Nails & Spa
          </span>
          <span className="text-border">|</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">
            Staff Portal
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200"
        >
          ← Public Site
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-4 text-center">
        <p className="text-[10px] text-offwhite/15 font-sans tracking-wide">
          Staff portal — authorised personnel only
        </p>
      </footer>
    </div>
  )
}

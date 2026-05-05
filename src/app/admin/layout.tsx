'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type SessionEmployee = { id: string; name: string; role: string }

const NAV = [
  { label: 'Dashboard',    href: '/admin/dashboard',     icon: '▦' },
  { label: 'Appointments', href: '/admin/appointments',  icon: '◈' },
  { label: 'Customers',    href: '/admin/customers',     icon: '◉' },
  { label: 'Staff',        href: '/admin/staff',         icon: '◎' },
  { label: 'Queue',        href: '/admin/queue',         icon: '◇' },
  { label: 'Schedule',     href: '/admin/schedule',      icon: '▤' },
  { label: 'Pricing',      href: '/admin/pricing',       icon: '$' },
  { label: 'Specials',     href: '/admin/specials',      icon: '◆' },
  { label: 'Complaints',   href: '/admin/complaints',    icon: '◌' },
  { label: 'Settings',     href: '/admin/settings',      icon: '◈' },
  { label: 'Guide',        href: '/admin/guide',         icon: '?' },
]

const COMING_SOON = [
  'Reports', 'Staff Notes', 'Announcements', 'Gift Cards', 'Inventory',
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin]   = useState<SessionEmployee | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname === '/admin') return  // login page — no auth required
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/admin'); return }
    const emp: SessionEmployee = JSON.parse(stored)
    if (emp.role !== 'admin') { router.replace('/employee/dashboard'); return }
    setAdmin(emp)
  }, [router, pathname])

  const handleSignOut = () => {
    sessionStorage.removeItem('rns_employee')
    router.push('/admin')
  }

  // Render the login page directly — no sidebar, no auth wall
  if (pathname === '/admin') return <>{children}</>

  if (!admin) return null

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <button
            key={item.href}
            onClick={() => { router.push(item.href); onClick?.() }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-left transition-all duration-150 group ${
              active
                ? 'bg-gold/10 text-gold border border-gold/25'
                : 'text-offwhite/50 hover:text-offwhite hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className={`text-base leading-none ${active ? 'text-gold' : 'text-offwhite/25 group-hover:text-offwhite/50'}`}>
              {item.icon}
            </span>
            <span className="text-xs tracking-widest uppercase font-sans font-medium">{item.label}</span>
          </button>
        )
      })}

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-[9px] tracking-widest uppercase text-offwhite/20 font-sans px-4 mb-2">Coming Soon</p>
        {COMING_SOON.map(label => (
          <div key={label}
            className="w-full flex items-center gap-3 px-4 py-2 opacity-35 cursor-not-allowed"
          >
            <span className="text-base leading-none text-offwhite/20">○</span>
            <span className="text-xs tracking-widest uppercase font-sans text-offwhite/40">{label}</span>
            <span className="ml-auto text-[8px] tracking-widest uppercase font-sans text-gold/40 border border-gold/20 px-1.5 py-0.5 rounded-sm">Soon</span>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-charcoal flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border/40 fixed top-0 left-0 h-full z-30 bg-charcoal">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border/30">
          <p className="text-[9px] tracking-[0.3em] uppercase text-gold/50 font-sans">Owner Portal</p>
          <p className="font-serif text-offwhite text-lg leading-tight mt-0.5">Royalty Nails</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border/30">
          <p className="text-[10px] font-sans text-offwhite/30 mb-2 truncate">{admin.name}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/employee/dashboard')}
              className="text-[10px] tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200"
            >
              Staff View
            </button>
            <button
              onClick={handleSignOut}
              className="text-[10px] tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200 ml-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-charcoal border-b border-border/40 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-gold/50 font-sans">Owner Portal</p>
          <p className="font-serif text-offwhite text-base leading-tight">Royalty Nails</p>
        </div>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="text-offwhite/50 hover:text-offwhite font-sans text-lg transition-colors duration-150 w-10 h-10 flex items-center justify-center"
        >
          {menuOpen ? '✕' : '≡'}
        </button>
      </div>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 bottom-0 w-64 bg-charcoal border-r border-border/40 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border/30 mt-14">
              <p className="font-serif text-offwhite text-lg">{admin.name}</p>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              <NavLinks onClick={() => setMenuOpen(false)} />
            </nav>
            <div className="px-4 py-4 border-t border-border/30 flex gap-4">
              <button onClick={() => { router.push('/employee/dashboard'); setMenuOpen(false) }}
                className="text-[10px] tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200">
                Staff View
              </button>
              <button onClick={handleSignOut}
                className="text-[10px] tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200 ml-auto">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-60 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

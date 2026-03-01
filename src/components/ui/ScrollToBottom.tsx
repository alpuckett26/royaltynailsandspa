'use client'

import { useState, useEffect } from 'react'

export function ScrollToBottom() {
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const distanceFromBottom = document.body.scrollHeight - window.scrollY - window.innerHeight
      setAtBottom(distanceFromBottom < 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={atBottom ? 'Scroll to top' : 'Scroll to bottom'}
      className="fixed bottom-6 right-6 z-40 w-9 h-9 flex items-center justify-center rounded-sm border border-border bg-charcoal/80 backdrop-blur-sm text-offwhite/20 hover:text-offwhite/50 hover:border-gold/30 transition-all duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`w-4 h-4 transition-transform duration-300 ${atBottom ? 'rotate-180' : ''}`}
      >
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

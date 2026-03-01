'use client'

export function ScrollToBottom() {
  return (
    <button
      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      aria-label="Scroll to bottom"
      className="fixed bottom-6 right-6 z-40 w-9 h-9 flex items-center justify-center rounded-sm border border-border bg-charcoal/80 backdrop-blur-sm text-offwhite/20 hover:text-offwhite/50 hover:border-gold/30 transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

'use client'

import { Button } from './Button'
import type { ComponentProps } from 'react'

type ButtonProps = Omit<ComponentProps<typeof Button>, 'href' | 'onClick'>

function openBooksy() {
  if (typeof window === 'undefined') return
  // Click the floating button Booksy's code.js injects (class: booksy-widget-button)
  const btn = document.querySelector<HTMLElement>('.booksy-widget-button')
  if (btn) { btn.click(); return }
  // Fallback: direct booking link (Booksy's deep-link format)
  window.open('https://booksy.com/en-us/dl/show-business/1710613', '_blank', 'noopener')
}

export function BookNowButton({ children = 'Book Now', ...props }: ButtonProps & { children?: React.ReactNode }) {
  return (
    <Button onClick={openBooksy} {...props}>
      {children}
    </Button>
  )
}

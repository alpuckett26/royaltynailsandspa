'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold-outline'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
  className?: string
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-charcoal font-semibold hover:bg-gold-light active:bg-gold-dark shadow-gold hover:shadow-gold-md',
  secondary:
    'bg-transparent text-offwhite border border-border hover:border-gold/40 hover:text-gold',
  ghost:
    'bg-transparent text-gold/80 hover:text-gold underline-offset-4 hover:underline',
  'gold-outline':
    'bg-transparent text-gold border border-gold/50 hover:border-gold hover:bg-gold/5',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-xs tracking-widest',
  md: 'px-7 py-3.5 text-xs tracking-widest',
  lg: 'px-10 py-4 text-sm tracking-widest',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      href,
      external,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = clsx(
      'inline-flex items-center justify-center gap-2 uppercase transition-all duration-300 ease-luxury font-sans',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (href) {
      if (external) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
            {children}
          </a>
        )
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

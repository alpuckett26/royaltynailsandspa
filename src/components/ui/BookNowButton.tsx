'use client'

import { useRouter } from 'next/navigation'
import { Button } from './Button'
import type { ComponentProps } from 'react'

type ButtonProps = Omit<ComponentProps<typeof Button>, 'href' | 'onClick'>

export function BookNowButton({ children = 'Book Now', ...props }: ButtonProps & { children?: React.ReactNode }) {
  const router = useRouter()
  return (
    <Button onClick={() => router.push('/book')} {...props}>
      {children}
    </Button>
  )
}

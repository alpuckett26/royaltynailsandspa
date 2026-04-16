'use client'

import { useRouter } from 'next/navigation'
import { Button } from './Button'
import type { ComponentProps } from 'react'

type ButtonProps = Omit<ComponentProps<typeof Button>, 'href' | 'onClick'>

export function BookNowButton({ children = 'Book Now', service, ...props }: ButtonProps & { children?: React.ReactNode; service?: string }) {
  const router = useRouter()
  const url = service ? `/book?service=${encodeURIComponent(service)}` : '/book'
  return (
    <Button onClick={() => router.push(url)} {...props}>
      {children}
    </Button>
  )
}

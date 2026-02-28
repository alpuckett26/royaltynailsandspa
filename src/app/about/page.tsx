import type { Metadata } from 'next'
import { BrandStory } from '@/components/about/BrandStory'
import { Values } from '@/components/about/Values'
import { CTABand } from '@/components/home/CTABand'
import { Testimonials } from '@/components/home/Testimonials'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn the story behind Royalty Nails & Spa — Rowlett\'s premier luxury nail salon. Meet our team, discover our values, and see why clients keep coming back.',
}

export default function AboutPage() {
  return (
    <>
      <BrandStory />
      <Values />
      <Testimonials />
      <CTABand />
    </>
  )
}

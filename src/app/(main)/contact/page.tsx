import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { BookingCTA } from '@/components/contact/BookingCTA'
import { FAQ } from '@/components/home/FAQ'

export const metadata: Metadata = {
  title: 'Contact & Book',
  description:
    'Book an appointment at Royalty Nails & Spa in Rowlett, TX. Call (214) 501-4300 or send a message. Walk-ins always welcome.',
}

export default function ContactPage() {
  return (
    <>
      <ContactForm />
      <BookingCTA />
      <FAQ />
    </>
  )
}

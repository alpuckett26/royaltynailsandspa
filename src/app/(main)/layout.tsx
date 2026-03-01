import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollToBottom } from '@/components/ui/ScrollToBottom'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ScrollToBottom />
    </>
  )
}

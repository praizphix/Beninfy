'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const AUTH_PAGES = ['/login', '/register']

export default function LocaleLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.some((p) => pathname.endsWith(p))

  if (isAuthPage) {
    return <div className="flex min-h-screen flex-col">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}

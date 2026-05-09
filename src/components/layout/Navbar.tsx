'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/rides', label: 'Rides', labelFr: 'Trajets' },
  { href: '/tours', label: 'Tours', labelFr: 'Tours' },
  { href: '/fleet', label: 'Fleet', labelFr: 'Flotte' },
  { href: '/border-info', label: 'Border Info', labelFr: 'Info Frontières' },
  { href: '/about', label: 'About', labelFr: 'À propos' },
] as const

export default function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const otherLocale = locale === 'en' ? 'fr' : 'en'
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`

  const isActive = (href: string) => pathname.includes(href)

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-shadow duration-200',
        scrolled
          ? 'bg-surface-container-lowest border-b border-outline-variant shadow-sm'
          : 'bg-surface-container-lowest border-b border-outline-variant'
      )}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-10">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center">
          <Image
            src="/logo.png"
            alt="Beninfy"
            width={120}
            height={52}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                'text-label-md transition-colors hover:text-primary',
                isActive(link.href)
                  ? 'border-b-2 border-primary pb-1 text-primary'
                  : 'text-on-surface-variant'
              )}
            >
              {locale === 'fr' ? link.labelFr : link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={switchPath}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-label-md text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">language</span>
            <span>{locale === 'en' ? 'EN/FR' : 'FR/EN'}</span>
          </Link>
          <Link
            href={`/${locale}/rides`}
            className="rounded-xl bg-primary px-6 py-2.5 text-label-md text-on-primary hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all duration-150"
          >
            Book Now
          </Link>
          <Link href={`/${locale}/login`} aria-label="Account">
            <span className="material-symbols-outlined text-[28px] text-primary cursor-pointer hover:text-primary-container transition-colors">
              account_circle
            </span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[24px]">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-outline-variant bg-surface-container-lowest md:hidden">
          <div className="mx-auto max-w-[1280px] space-y-1 px-4 pb-6 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  'block rounded-lg px-4 py-3 text-label-md transition-colors',
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                )}
              >
                {locale === 'fr' ? link.labelFr : link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-t border-outline-variant pt-4 mt-4">
              <Link
                href={switchPath}
                className="flex items-center gap-1.5 rounded-full border border-outline-variant px-4 py-2 text-label-md text-secondary"
              >
                <span className="material-symbols-outlined text-[16px]">language</span>
                {otherLocale.toUpperCase()}
              </Link>
              <Link
                href={`/${locale}/rides`}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-label-md text-on-primary"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

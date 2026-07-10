'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { isAdminRole } from '@/lib/roles'

const NAV_LINKS = [
  { href: '', key: 'home' },
  { href: '/rides', key: 'rides' },
  { href: '/tours', key: 'tours' },
  { href: '/fleet', key: 'fleet' },
  { href: '/border-info', key: 'borderInfo' },
  { href: '/about', key: 'about' },
] as const

export default function Navbar() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const sessionRole = (session?.user as { role?: string } | undefined)?.role
  const isCustomerSession = status === 'authenticated' && session?.user && !isAdminRole(sessionRole)
  const customerUser = isCustomerSession ? session.user : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const otherLocale = locale === 'en' ? 'fr' : 'en'
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`

  const localizedHome = `/${locale}`
  const isActive = (href: string) => {
    if (!href) return pathname === localizedHome || pathname === `${localizedHome}/`
    return pathname.includes(href)
  }

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
            width={220}
            height={96}
            className="h-20 w-auto object-contain md:h-16"
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
              {t(link.key)}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={switchPath}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-label-md text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">language</span>
            <span>{locale === 'en' ? 'EN/FR' : 'FR/EN'}</span>
          </a>
          <Link
            href={`/${locale}/rides`}
            className="rounded-xl bg-primary px-6 py-2.5 text-label-md text-on-primary hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all duration-150"
          >
            {t('bookNow')}
          </Link>
          {customerUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-surface-container transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-sm font-bold">
                  {(customerUser.name ?? customerUser.email ?? 'B')
                    .split(/\s+/)
                    .map((s) => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden"
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-label-md truncate">{customerUser.name ?? 'Account'}</p>
                    {customerUser.email && (
                      <p className="text-label-sm text-on-surface-variant truncate">{customerUser.email}</p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/dashboard`}
                    className="block px-4 py-2.5 text-label-md hover:bg-surface-container"
                    onClick={() => setAccountOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    className="block px-4 py-2.5 text-label-md hover:bg-surface-container"
                    onClick={() => setAccountOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false)
                      signOut({ callbackUrl: `/${locale}` })
                    }}
                    className="w-full text-left px-4 py-2.5 text-label-md text-red-600 hover:bg-surface-container"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/login`}
                className="text-label-md text-on-surface-variant hover:text-primary px-3 py-2 transition-colors"
              >
                {t('signIn')}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-xl border border-primary text-primary px-4 py-2 text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          )}
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
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block rounded-lg px-4 py-3 text-label-md transition-colors',
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-t border-outline-variant pt-4 mt-4">
              <a
                href={switchPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-full border border-outline-variant px-4 py-2 text-label-md text-secondary"
              >
                <span className="material-symbols-outlined text-[16px]">language</span>
                {otherLocale.toUpperCase()}
              </a>
              <Link
                href={`/${locale}/rides`}
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-label-md text-on-primary"
              >
                {t('bookNow')}
              </Link>
            </div>
            {customerUser ? (
              <div className="border-t border-outline-variant pt-3 mt-3 space-y-1">
                <div className="px-4 py-2">
                  <p className="text-label-md truncate">{customerUser.name ?? 'Account'}</p>
                  {customerUser.email && (
                    <p className="text-label-sm text-on-surface-variant truncate">{customerUser.email}</p>
                  )}
                </div>
                <Link href={`/${locale}/dashboard`} onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-3 text-label-md text-on-surface-variant hover:bg-surface-container">
                  Dashboard
                </Link>
                <Link href={`/${locale}/profile`} onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-3 text-label-md text-on-surface-variant hover:bg-surface-container">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="w-full text-left rounded-lg px-4 py-3 text-label-md text-red-600 hover:bg-surface-container"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-outline-variant pt-3 mt-3">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-outline-variant py-3 text-center text-label-md text-on-surface-variant hover:bg-surface-container"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-primary py-3 text-center text-label-md text-on-primary"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

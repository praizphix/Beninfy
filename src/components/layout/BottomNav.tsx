'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

const BOTTOM_NAV = [
  { href: '/rides', icon: 'directions_car', label: 'Rides', labelFr: 'Trajets' },
  { href: '/tours', icon: 'map', label: 'Tours', labelFr: 'Tours' },
  { href: '/fleet', icon: 'airport_shuttle', label: 'Fleet', labelFr: 'Flotte' },
  { href: '/border-info', icon: 'security', label: 'Safety', labelFr: 'Sécurité' },
] as const

export default function BottomNav() {
  const locale = useLocale()
  const pathname = usePathname()

  const isActive = (href: string) => pathname.includes(href)

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-2 bg-surface-container border-t border-outline-variant md:hidden z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      {BOTTOM_NAV.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className={cn(
              'flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all',
              active
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <span className={cn('material-symbols-outlined text-[22px]', active && 'icon-fill')}>
              {item.icon}
            </span>
            <span className="text-label-sm mt-0.5">
              {locale === 'fr' ? item.labelFr : item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

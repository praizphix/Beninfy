import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { setRequestLocale } from 'next-intl/server'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const NAV = [
  { href: '', label: 'Overview', icon: 'dashboard' },
  { href: '/bookings', label: 'Bookings', icon: 'event' },
  { href: '/payments', label: 'Payments', icon: 'payments' },
  { href: '/users', label: 'Users', icon: 'group' },
  { href: '/vehicles', label: 'Vehicles', icon: 'directions_car' },
  { href: '/fleet-vehicles', label: 'Fleet units', icon: 'garage' },
  { href: '/drivers', label: 'Drivers', icon: 'badge' },
  { href: '/routes', label: 'Routes', icon: 'route' },
  { href: '/tours', label: 'Tours', icon: 'travel_explore' },
  { href: '/border-fees', label: 'Border fees', icon: 'currency_exchange' },
]

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user?.id) redirect(`/${locale}/admin-login`)
  if (role !== 'admin' && role !== 'super_admin') redirect(`/${locale}/dashboard`)

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f2f8' }}>
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href={`/${locale}`} className="block">
            <p className="text-sm font-bold" style={{ color: '#3e004c' }}>Beninfy</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">Backoffice</p>
          </Link>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={`/${locale}/admin${n.href}`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <div className="px-2 py-2 mb-1">
            <p className="text-xs font-medium text-gray-800 truncate">{session.user.name ?? 'Admin'}</p>
            <p className="text-[11px] text-gray-400 truncate">{session.user.email}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{role === 'super_admin' ? 'Super admin' : 'Admin'}</p>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: `/${locale}/login` })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  )
}

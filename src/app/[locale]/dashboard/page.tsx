'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { formatNGN } from '@/lib/utils'
import PulseStatus, { DepartureRow } from '@/components/shared/PulseStatus'

type TripStatus = 'confirmed' | 'pending' | 'completed' | 'active'

interface Trip {
  id: string
  ref: string
  from: string
  to: string
  date: string
  vehicle: string
  passengers: number
  amount: number
  status: TripStatus
  driver?: string
  plate?: string
  pickupEta?: string
}

interface BookingApi {
  id: string
  from: string
  to: string
  date: string
  vehicleId: string
  passengers: number
  priceNGN: number
  status: string
  createdAt: string
}

const activeTrip: Trip | null = null

const statusColors: Record<TripStatus, string> = {
  active: 'bg-primary text-on-primary',
  confirmed: 'bg-primary-container text-on-primary-container',
  pending: 'bg-secondary-container text-on-secondary-container',
  completed: 'bg-surface-container-high text-on-surface-variant',
}

const LIVE_DEPARTURES = [
  { from: 'Lagos', to: 'Cotonou', time: '08:30', status: 'boarding' as const, vehicle: 'Executive SUV' },
  { from: 'Cotonou', to: 'Lomé', time: '09:00', status: 'on-time' as const, vehicle: 'Toyota Sienna' },
  { from: 'Lagos', to: 'Accra', time: '10:15', status: 'delayed' as const, vehicle: 'Toyota Prado' },
  { from: 'Abuja', to: 'Lagos', time: '11:45', status: 'en-route' as const, vehicle: 'Saloon Car' },
]

type NavItem = 'dashboard' | 'profile' | 'payments' | 'support' | 'settings'

export default function DashboardPage() {
  const locale = useLocale()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/login`)
      return
    }
    if (status !== 'authenticated') return
    let cancelled = false
    setLoading(true)
    fetch('/api/bookings')
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((data: { bookings?: BookingApi[] }) => {
        if (cancelled) return
        const mapped: Trip[] = (data.bookings ?? []).map((b) => ({
          id: b.id,
          ref: `BFY-${b.id.slice(-8).toUpperCase()}`,
          from: b.from,
          to: b.to,
          date: b.date,
          vehicle: b.vehicleId,
          passengers: b.passengers,
          amount: b.priceNGN,
          status: (b.status as TripStatus) ?? 'pending',
        }))
        setTrips(mapped)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [status, router, locale])

  const now = Date.now()
  const upcoming = trips.filter((t) => new Date(t.date).getTime() >= now && t.status !== 'completed')
  const history = trips.filter((t) => new Date(t.date).getTime() < now || t.status === 'completed')

  const userName = session?.user?.name ?? session?.user?.email ?? 'Traveler'
  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navItems: { id: NavItem; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'support', label: 'Support', icon: 'support_agent' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const totalSpend = history.reduce((a, t) => a + t.amount, 0)

  const handleCancel = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Cancel this booking?')) return
    setCancellingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Cancel failed')
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch {
      // swallow; could surface a toast later
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mt-16 max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5">
            {/* Profile card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-outline-variant">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary text-headline-sm font-bold">{initials || 'B'}</div>
                <div>
                  <p className="text-headline-sm text-primary">{userName}</p>
                  <p className="text-body-sm text-on-surface-variant">Member</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Link
                      href={`/${locale}/profile`}
                      className="text-label-sm text-primary hover:underline"
                    >
                      Edit profile
                    </Link>
                    <span className="text-outline-variant">·</span>
                    <button
                      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                      className="text-label-sm text-primary hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveNav(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-label-md transition-colors text-left ${activeNav === id ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${activeNav === id ? 'icon-fill' : ''}`}>{icon}</span>
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Saved travelers */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h3 className="text-headline-sm mb-4">Saved Travelers</h3>
              <div className="space-y-4">
                {[{ init: 'AK', name: 'Abeba K.' }, { init: 'JM', name: 'Jean M.' }].map(({ init, name }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">{init}</div>
                      <span className="text-body-md">{name}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors text-[18px]">edit</span>
                  </div>
                ))}
                <button className="w-full py-2.5 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant text-label-md flex items-center justify-center gap-2 hover:bg-surface-container hover:border-primary transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span> Add Traveler
                </button>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h3 className="text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-headline-sm text-primary">{trips.length}</p>
                  <p className="text-body-sm text-on-surface-variant">Total Trips</p>
                </div>
                <div>
                  <p className="text-headline-sm text-secondary">{formatNGN(totalSpend)}</p>
                  <p className="text-body-sm text-on-surface-variant">Total Spent</p>
                </div>
                <div>
                  <p className="text-headline-sm text-primary">3</p>
                  <p className="text-body-sm text-on-surface-variant">Countries Visited</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Active trip banner */}
            {activeTrip ? (
              <section className="relative overflow-hidden bg-primary rounded-2xl p-8 text-on-primary shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">directions_car</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1 rounded-full w-fit">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-label-sm uppercase tracking-wider">Vehicle Assigned</span>
                    </div>
                    <h2 className="text-headline-lg">{activeTrip.from} to {activeTrip.to}</h2>
                    <p className="text-body-md opacity-90">{activeTrip.vehicle} • {activeTrip.plate} • Driver: {activeTrip.driver}</p>
                    <p className="text-label-sm opacity-75">Ref: #{activeTrip.ref}</p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant text-center">
                <span className="material-symbols-outlined text-primary text-[48px]">directions_car</span>
                <h2 className="text-headline-sm mt-3">Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}</h2>
                <p className="text-body-md text-on-surface-variant mt-1">{loading ? 'Loading your trips…' : 'You have no active ride. Book one to get started.'}</p>
                <Link
                  href={`/${locale}/rides`}
                  className="inline-flex items-center gap-2 mt-5 bg-primary text-on-primary px-6 py-3 rounded-xl text-label-md hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Book a ride
                </Link>
              </section>
            )}

            {/* Upcoming + History grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming trips */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm">Upcoming Trips</h3>
                  <a href="#" className="text-primary text-label-md hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {upcoming.length === 0 && !loading && (
                    <p className="text-body-sm text-on-surface-variant">No upcoming trips yet.</p>
                  )}
                  {upcoming.map((trip) => (
                    <div key={trip.id} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface-container rounded-xl text-primary">
                            <span className="material-symbols-outlined text-[20px]">airport_shuttle</span>
                          </div>
                          <div>
                            <p className="text-label-md">{trip.from} → {trip.to}</p>
                            <p className="text-body-sm text-on-surface-variant">
                              {new Date(trip.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <span className="text-label-md text-secondary">{formatNGN(trip.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <PulseStatus status={trip.status === 'confirmed' ? 'on-time' : trip.status === 'pending' ? 'boarding' : 'en-route'} />
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-xs">{trip.vehicle}</span>
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-xs">{trip.passengers} pax</span>
                      </div>
                      {trip.driver && (
                        <p className="text-body-sm text-on-surface-variant mt-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span> Driver: {trip.driver}
                        </p>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancel(trip.id)}
                          disabled={cancellingId === trip.id}
                          className="text-label-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-wait inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          {cancellingId === trip.id ? 'Cancelling…' : 'Cancel booking'}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link
                    href={`/${locale}/rides`}
                    className="w-full py-3.5 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant text-label-md flex items-center justify-center gap-2 hover:bg-surface-container hover:border-primary hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> Book New Ride
                  </Link>
                </div>
              </section>

              {/* Booking history */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm">Booking History</h3>
                  <a href="#" className="text-primary text-label-md hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {history.length === 0 && !loading && (
                    <p className="text-body-sm text-on-surface-variant">No past trips yet.</p>
                  )}
                  {history.map((trip) => (
                    <div key={trip.id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-container rounded-xl text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-label-md truncate">{trip.from} → {trip.to}</p>
                            <span className="text-label-md text-on-surface-variant ml-2 shrink-0">{formatNGN(trip.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-body-sm text-on-surface-variant">{new Date(trip.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <span className="w-1 h-1 bg-outline rounded-full" />
                            <p className="text-body-sm text-on-surface-variant">{trip.vehicle}</p>
                          </div>
                          <p className="text-label-sm text-on-surface-variant/60 mt-0.5">#{trip.ref}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Live Departures board */}
            <section className="bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-800">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-yellow-400" style={{ fontSize: 22 }}>departure_board</span>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">Live Departures</h3>
                </div>
                <PulseStatus status="en-route" />
              </div>
              <div className="space-y-2">
                {LIVE_DEPARTURES.map((dep) => (
                  <DepartureRow
                    key={dep.time}
                    from={dep.from}
                    to={dep.to}
                    time={dep.time}
                    status={dep.status}
                    vehicle={dep.vehicle}
                  />
                ))}
              </div>
            </section>

            {/* Quick actions */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
              <h3 className="text-headline-sm mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: 'directions_car', label: 'Book a Ride', href: `/${locale}/rides` },
                  { icon: 'map', label: 'Explore Tours', href: `/${locale}/tours` },
                  { icon: 'security', label: 'Border Info', href: `/${locale}/border-info` },
                  { icon: 'support_agent', label: 'Get Support', href: `https://wa.me/2348000000000` },
                ].map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('https') ? '_blank' : '_self'}
                    rel={href.startsWith('https') ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center gap-3 p-5 bg-surface-container-low rounded-2xl hover:bg-primary-container/20 hover:border-primary border border-outline-variant/50 transition-all group"
                  >
                    <span className="material-symbols-outlined text-primary text-[28px] group-hover:scale-110 transition-transform">{icon}</span>
                    <span className="text-label-md text-center">{label}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

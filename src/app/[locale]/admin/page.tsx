import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { formatNGN } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [bookingsTotal, bookingsThisMonth, usersTotal, paymentsTotal, paidAgg, recentBookings, statusCounts] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count(),
    prisma.payment.count(),
    prisma.payment.aggregate({ where: { status: 'paid' }, _sum: { amountNGN: true } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { name: true } },
      },
    }),
    prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const cards = [
    { label: 'Bookings', value: bookingsTotal, sub: `${bookingsThisMonth} this month`, icon: 'event' },
    { label: 'Revenue (paid)', value: formatNGN(paidAgg._sum.amountNGN ?? 0), sub: `${paymentsTotal} payments`, icon: 'payments' },
    { label: 'Users', value: usersTotal, sub: 'registered', icon: 'group' },
    { label: 'Status mix', value: statusCounts.map((s) => `${s.status}:${s._count._all}`).join(' · ') || '—', sub: 'bookings', icon: 'donut_small' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>Overview</h1>
          <p className="text-sm text-gray-500">Operational snapshot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">{c.label}</span>
              <span className="material-symbols-outlined text-[20px] text-gray-300">{c.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#3e004c' }}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold" style={{ color: '#3e004c' }}>Recent bookings</h2>
          <Link href={`/${locale}/admin/bookings`} className="text-xs text-purple-700 hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Customer</th>
              <th className="text-left px-5 py-3">Route</th>
              <th className="text-left px-5 py-3">Vehicle</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id} className="border-t border-gray-100">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{b.user?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{b.user?.email ?? 'guest'}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{b.from} → {b.to}</td>
                <td className="px-5 py-3 text-gray-700">{b.vehicle?.name ?? b.vehicleId}</td>
                <td className="px-5 py-3 text-gray-700">{new Date(b.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-gray-800">{formatNGN(b.priceNGN)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                    b.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    b.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
            {recentBookings.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

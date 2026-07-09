import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { formatNGN } from '@/lib/utils'
import { AdminPageHeader, AdminStatCard, AdminStatusBadge } from '@/components/admin/AdminUI'

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
    { label: 'Bookings', value: bookingsTotal, sub: `${bookingsThisMonth} this month`, icon: 'event', tone: 'purple' as const },
    { label: 'Revenue paid', value: formatNGN(paidAgg._sum.amountNGN ?? 0), sub: `${paymentsTotal} payment records`, icon: 'payments', tone: 'gold' as const },
    { label: 'Customers', value: usersTotal, sub: 'registered accounts', icon: 'group', tone: 'blue' as const },
    { label: 'Status mix', value: statusCounts.length, sub: statusCounts.map((s) => `${s.status}: ${s._count._all}`).join(' · ') || 'No bookings yet', icon: 'donut_small', tone: 'green' as const },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Monitor bookings, collections, customers, and recent operational activity from one command view."
        icon="space_dashboard"
        actions={
          <Link
            href={`/${locale}/admin/bookings`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3e004c] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,0,76,0.18)] transition-colors hover:bg-[#50115f]"
          >
            <span className="material-symbols-outlined text-[18px]">event</span>
            Open bookings
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <AdminStatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-[#3e004c]">Recent bookings</h2>
            <p className="text-xs text-gray-400">Latest customer activity across routes.</p>
          </div>
          <Link href={`/${locale}/admin/bookings`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-[#f7eff8]">
            View all
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fbf7fc] text-xs uppercase tracking-[0.14em] text-gray-500">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold">Customer</th>
              <th className="text-left px-5 py-3.5 font-semibold">Route</th>
              <th className="text-left px-5 py-3.5 font-semibold">Vehicle</th>
              <th className="text-left px-5 py-3.5 font-semibold">Date</th>
              <th className="text-left px-5 py-3.5 font-semibold">Amount</th>
              <th className="text-left px-5 py-3.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id} className="border-t border-gray-100 transition-colors hover:bg-[#fcf9fd]">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800">{b.user?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{b.user?.email ?? 'guest'}</p>
                </td>
                <td className="px-5 py-4 text-gray-700">{b.from} → {b.to}</td>
                <td className="px-5 py-4 text-gray-700">{b.vehicle?.name ?? b.vehicleId}</td>
                <td className="px-5 py-4 text-gray-700">{new Date(b.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 font-semibold text-gray-900">{formatNGN(b.priceNGN)}</td>
                <td className="px-5 py-4">
                  <AdminStatusBadge status={b.status} />
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
    </div>
  )
}

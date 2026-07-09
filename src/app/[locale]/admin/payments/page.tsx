'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatNGN } from '@/lib/utils'
import { AdminPageHeader, AdminStatusBadge } from '@/components/admin/AdminUI'

interface PaymentRow {
  id: string
  reference: string
  status: string
  amountNGN: number
  createdAt: string
  booking: {
    id: string
    from: string
    to: string
    date: string
    priceNGN: number
    user: { id: string; name: string | null; email: string | null } | null
  } | null
}

const STATUSES = ['', 'pending', 'paid', 'failed']

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/payments?${params.toString()}`)
    const data = await res.json()
    setPayments(data.payments ?? [])
    setLoading(false)
  }, [status])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Review transaction references, payment status, booking links, and customer payment history."
        icon="payments"
        actions={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-[#eaddec] bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3e004c] focus:ring-2 focus:ring-[#3e004c]/15"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{payments.length} payments</p>
            <p className="text-xs text-gray-400">Filtered by current payment state.</p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-gray-300">receipt_long</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fbf7fc] text-xs uppercase tracking-[0.14em] text-gray-500">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold">Reference</th>
              <th className="text-left px-5 py-3.5 font-semibold">Customer</th>
              <th className="text-left px-5 py-3.5 font-semibold">Booking</th>
              <th className="text-left px-5 py-3.5 font-semibold">Amount</th>
              <th className="text-left px-5 py-3.5 font-semibold">Status</th>
              <th className="text-left px-5 py-3.5 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-14 text-center text-gray-400">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-14 text-center text-gray-400">No payments.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 transition-colors hover:bg-[#fcf9fd]">
                <td className="px-5 py-4"><code className="rounded-lg bg-[#fbf7fc] px-2 py-1 text-xs text-gray-700">{p.reference}</code></td>
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800">{p.booking?.user?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{p.booking?.user?.email ?? 'guest'}</p>
                </td>
                <td className="px-5 py-4 text-gray-700">{p.booking ? `${p.booking.from} → ${p.booking.to}` : '—'}</td>
                <td className="px-5 py-4 font-semibold text-gray-900">{formatNGN(p.amountNGN)}</td>
                <td className="px-5 py-4">
                  <AdminStatusBadge status={p.status} />
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatNGN } from '@/lib/utils'

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
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>Payments</h1>
          <p className="text-sm text-gray-500">Transaction history.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Reference</th>
              <th className="text-left px-5 py-3">Customer</th>
              <th className="text-left px-5 py-3">Booking</th>
              <th className="text-left px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No payments.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-5 py-3"><code className="text-xs text-gray-600">{p.reference}</code></td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{p.booking?.user?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{p.booking?.user?.email ?? 'guest'}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{p.booking ? `${p.booking.from} → ${p.booking.to}` : '—'}</td>
                <td className="px-5 py-3 text-gray-800">{formatNGN(p.amountNGN)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    p.status === 'paid' ? 'bg-green-50 text-green-700' :
                    p.status === 'failed' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{p.status}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

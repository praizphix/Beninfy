'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatNGN } from '@/lib/utils'

interface BookingRow {
  id: string
  from: string
  to: string
  date: string
  returnDate: string | null
  tripType: string
  passengers: number
  priceNGN: number
  status: string
  createdAt: string
  passengerName: string | null
  passengerEmail: string | null
  passengerPhone: string | null
  user: { id: string; name: string | null; email: string | null; phone: string | null } | null
  vehicle: { id: string; name: string } | null
  payments: { id: string; status: string; amountNGN: number; reference: string }[]
  legs: BookingLegRow[]
}

interface BookingLegRow {
  id: string
  direction: string
  from: string
  to: string
  departureDate: string
  vehicleId: string
  status: string
  fleetVehicleId: string | null
  driverId: string | null
  fleetVehicle: { id: string; label: string; plateNumber: string } | null
  driver: { id: string; name: string; phone: string } | null
}

interface FleetVehicleOption {
  id: string
  vehicleId: string
  label: string
  plateNumber: string
  status: string
}

interface DriverOption {
  id: string
  name: string
  phone: string
  status: string
}

const STATUSES = ['', 'pending', 'confirmed', 'cancelled', 'completed']

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicleOption[]>([])
  const [drivers, setDrivers] = useState<DriverOption[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    const res = await fetch(`/api/admin/bookings?${params.toString()}`)
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setLoading(false)
  }, [status, q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/fleet-vehicles').then((r) => r.ok ? r.json() : { fleetVehicles: [] }),
      fetch('/api/admin/drivers').then((r) => r.ok ? r.json() : { drivers: [] }),
    ]).then(([fleetData, driverData]) => {
      setFleetVehicles(fleetData.fleetVehicles ?? [])
      setDrivers(driverData.drivers ?? [])
    })
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    setBusy(id)
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      await load()
    } finally { setBusy(null) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete booking (and its payments)?')) return
    setBusy(id)
    try {
      await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } finally { setBusy(null) }
  }

  const assignLeg = async (legId: string, payload: { fleetVehicleId?: string | null; driverId?: string | null }) => {
    setBusy(legId)
    try {
      const res = await fetch(`/api/admin/booking-legs/${legId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) alert(data.error ?? 'Assignment failed')
      await load()
    } finally { setBusy(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>Bookings</h1>
          <p className="text-sm text-gray-500">All bookings across customers.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search route, customer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Customer</th>
              <th className="text-left px-5 py-3">Route</th>
              <th className="text-left px-5 py-3">Vehicle</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Legs</th>
              <th className="text-left px-5 py-3">Pax</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Payments</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">No bookings.</td></tr>
            ) : bookings.map((b) => (
              <tr key={b.id} className="border-t border-gray-100 align-top">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{b.passengerName ?? b.user?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{b.passengerEmail ?? b.user?.email ?? 'guest'}</p>
                  {(b.passengerPhone ?? b.user?.phone) && <p className="text-xs text-gray-400">{b.passengerPhone ?? b.user?.phone}</p>}
                </td>
                <td className="px-5 py-3 text-gray-700">
                  <p>{b.from} → {b.to}</p>
                  <p className="text-xs text-gray-400">{b.tripType === 'round_trip' ? 'round trip' : 'one way'}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{b.vehicle?.name ?? b.id}</td>
                <td className="px-5 py-3 text-gray-700">{new Date(b.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 min-w-[300px]">
                  <div className="space-y-3">
                    {b.legs.map((leg) => (
                      <div key={leg.id} className="rounded-lg border border-gray-100 p-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-xs font-semibold text-gray-800">{leg.direction}: {leg.from} → {leg.to}</p>
                          <span className="text-[10px] uppercase text-gray-400">{new Date(leg.departureDate).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <select
                            value={leg.fleetVehicleId ?? ''}
                            disabled={busy === leg.id}
                            onChange={(e) => assignLeg(leg.id, { fleetVehicleId: e.target.value || null })}
                            className="text-xs border border-gray-200 rounded-md px-2 py-1"
                          >
                            <option value="">Assign fleet unit</option>
                            {fleetVehicles
                              .filter((v) => v.vehicleId === leg.vehicleId)
                              .map((v) => (
                                <option key={v.id} value={v.id}>{v.label} · {v.plateNumber} · {v.status}</option>
                              ))}
                          </select>
                          <select
                            value={leg.driverId ?? ''}
                            disabled={busy === leg.id}
                            onChange={(e) => assignLeg(leg.id, { driverId: e.target.value || null })}
                            className="text-xs border border-gray-200 rounded-md px-2 py-1"
                          >
                            <option value="">Assign driver</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>{d.name} · {d.status}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700">{b.passengers}</td>
                <td className="px-5 py-3 text-gray-800">{formatNGN(b.priceNGN)}</td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {b.payments.length === 0 ? '—' : b.payments.map((p) => (
                    <div key={p.id}>
                      <span className={p.status === 'paid' ? 'text-green-700' : p.status === 'failed' ? 'text-red-600' : 'text-amber-700'}>{p.status}</span>
                      {' '}{formatNGN(p.amountNGN)}
                    </div>
                  ))}
                </td>
                <td className="px-5 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    disabled={busy === b.id}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="completed">completed</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button onClick={() => remove(b.id)} disabled={busy === b.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

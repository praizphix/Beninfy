'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { vehicles } from '@/data/vehicles'
import { routes } from '@/data/routes'
import { getRouteBasePrice } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import type { VehicleId, RouteId } from '@/types'

function PassengerDetailsContent() {
  const locale = useLocale()
  const router = useRouter()
  const params = useSearchParams()

  const vehicleId = (params.get('vehicle') ?? 'saloon') as VehicleId
  const from = params.get('from') ?? 'Lagos'
  const to = params.get('to') ?? 'Cotonou'
  const date = params.get('date') ?? ''
  const tripType = params.get('tripType') ?? 'one-way'

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0]
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const basePrice = matchedRoute ? getRouteBasePrice(matchedRoute.id as RouteId) : null

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportId: '',
    nationality: '',
    specialRequirements: '',
    pickupAddress: '',
    dropoffAddress: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.passportId.trim()) e.passportId = 'Passport/ID required for border crossing'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const search = new URLSearchParams({
      vehicle: vehicleId, from, to, date, tripType,
      name: form.fullName, email: form.email, phone: form.phone,
    })
    router.push(`/${locale}/rides/pay?${search.toString()}`)
  }

  const borderProtocolFee = 5000
  const serviceFee = basePrice ? Math.round(basePrice * 0.05) : 0
  const total = (basePrice ?? 0) + borderProtocolFee + serviceFee

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 max-w-[1280px] mx-auto px-4 md:px-10 py-10">

        {/* Back link */}
        <Link
          href={`/${locale}/rides`}
          className="inline-flex items-center gap-1.5 text-on-surface-variant text-label-md hover:text-primary mb-8 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Rides
        </Link>

        {/* Progress stepper */}
        <div className="flex items-center mb-10 max-w-lg">
          {([
            { n: 1, label: 'Search', done: true },
            { n: 2, label: 'Details', active: true },
            { n: 3, label: 'Payment' },
            { n: 4, label: 'Confirmed' },
          ] as { n: number; label: string; done?: boolean; active?: boolean }[]).map(({ n, label, done, active }, i, arr) => (
            <div key={n} className={`flex items-center ${i < arr.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-label-sm font-semibold transition-all ${
                  done
                    ? 'bg-primary text-on-primary'
                    : active
                    ? 'bg-primary text-on-primary ring-[3px] ring-offset-[3px] ring-primary/30'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {done ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                  ) : n}
                </div>
                <span className={`text-[11px] font-medium leading-none ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}>{label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 ${done ? 'bg-primary' : 'bg-outline-variant'}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-headline-lg text-primary mb-2">Complete Your Booking</h1>
        <p className="text-on-surface-variant text-body-md mb-8">Please provide passenger details for your executive border crossing.</p>

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: form */}
            <div className="lg:col-span-8 space-y-6">
              {/* Passenger info */}
              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[24px]">person</span>
                  <h2 className="text-headline-sm">Passenger Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { id: 'fullName', label: 'Full Name', placeholder: 'As it appears on ID', type: 'text' },
                    { id: 'email', label: 'Email Address', placeholder: 'example@domain.com', type: 'email' },
                    { id: 'phone', label: 'Phone Number', placeholder: '+234 ...', type: 'tel' },
                    { id: 'passportId', label: 'Passport / ID Number', placeholder: 'For border protocols', type: 'text' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="flex flex-col gap-1.5">
                      <label className="text-label-md text-on-surface-variant">{label}</label>
                      <input
                        type={type}
                        value={form[id as keyof typeof form]}
                        onChange={set(id as keyof typeof form)}
                        placeholder={placeholder}
                        className={`bg-surface p-4 rounded-xl border ${errors[id as keyof typeof form] ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md`}
                      />
                      {errors[id as keyof typeof form] && (
                        <span className="text-label-sm text-error">{errors[id as keyof typeof form]}</span>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md text-on-surface-variant">Nationality</label>
                    <select
                      value={form.nationality}
                      onChange={set('nationality')}
                      className="bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary outline-none text-body-md"
                    >
                      <option value="">Select nationality</option>
                      {['Nigerian', 'Beninese', 'Togolese', 'Ghanaian', 'Other'].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-label-md text-on-surface-variant">Special Requirements</label>
                    <textarea
                      value={form.specialRequirements}
                      onChange={set('specialRequirements')}
                      placeholder="Dietary needs, accessibility requirements, VIP escort request..."
                      rows={3}
                      className="bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Pickup / dropoff */}
              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
                  <h2 className="text-headline-sm">Pickup & Drop-off</h2>
                </div>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md text-on-surface-variant">Pickup Address in {from}</label>
                    <input
                      type="text"
                      value={form.pickupAddress}
                      onChange={set('pickupAddress')}
                      placeholder="Full street address or landmark"
                      className="bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md text-on-surface-variant">Drop-off Address in {to}</label>
                    <input
                      type="text"
                      value={form.dropoffAddress}
                      onChange={set('dropoffAddress')}
                      placeholder="Full street address or hotel name"
                      className="bg-surface p-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    />
                  </div>
                </div>
              </section>

              {/* Border protocol notice */}
              <div className="bg-secondary-container/20 rounded-2xl p-6 border border-secondary/20 flex gap-4">
                <span className="material-symbols-outlined text-secondary icon-fill text-[28px] shrink-0">info</span>
                <div>
                  <h3 className="text-label-md text-secondary mb-1">Border Protocol Included</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Beninfy handles all border documentation, customs clearance, and immigration facilitation on your behalf.
                    Please ensure your passport is valid for at least 6 months and you have your Yellow Fever certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: booking summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-outline-variant">
                  <h2 className="text-headline-sm mb-5">Booking Summary</h2>

                  {/* Route */}
                  <div className="flex items-center gap-3 mb-5 p-4 bg-surface-container-low rounded-xl">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[18px]">radio_button_checked</span>
                      <div className="w-px h-8 bg-outline-variant" />
                      <span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-label-sm text-on-surface-variant uppercase">From</p>
                        <p className="text-label-md">{from}</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant uppercase">To</p>
                        <p className="text-label-md">{to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">airport_shuttle</span>
                    <div>
                      <p className="text-label-md">{vehicle.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{vehicle.capacity} passengers • {tripType}</p>
                    </div>
                  </div>

                  {/* Date */}
                  {date && (
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-outline-variant">
                      <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                      <p className="text-label-md">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  )}

                  {/* Price breakdown */}
                  {basePrice && (
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Ride Fare</span>
                        <span>{formatNGN(basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Border Protocol Fee</span>
                        <span>{formatNGN(borderProtocolFee)}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Service Fee (5%)</span>
                        <span>{formatNGN(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-outline-variant">
                        <span className="text-headline-sm">Total</span>
                        <span className="text-headline-sm text-secondary">{formatNGN(total)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary py-4 rounded-xl text-label-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    Continue to Payment
                  </button>
                </section>

                {/* Trust badges */}
                <div className="bg-secondary-container/10 rounded-xl p-4 border border-secondary/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary icon-fill text-[20px] shrink-0">verified</span>
                  <div>
                    <p className="text-label-md text-on-secondary-container">Beninfy Guarantee</p>
                    <p className="text-body-sm text-on-surface-variant">All payments held in escrow until your journey completes. 24/7 support included.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PassengerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span></div>}>
      <PassengerDetailsContent />
    </Suspense>
  )
}

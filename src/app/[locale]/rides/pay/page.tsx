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

type PaymentMethod = 'card' | 'mobile-money' | 'bank-transfer'

function PaymentContent() {
  const locale = useLocale()
  const router = useRouter()
  const params = useSearchParams()

  const vehicleId = (params.get('vehicle') ?? 'saloon') as VehicleId
  const from = params.get('from') ?? 'Lagos'
  const to = params.get('to') ?? 'Cotonou'
  const date = params.get('date') ?? ''
  const passengerName = params.get('name') ?? 'Passenger'

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0]
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const basePrice = matchedRoute ? getRouteBasePrice(matchedRoute.id as RouteId) : 120000

  const borderFee = 5000
  const serviceFee = Math.round((basePrice ?? 0) * 0.05)
  const total = (basePrice ?? 0) + borderFee + serviceFee

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [processing, setProcessing] = useState(false)

  const setCardField = (f: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCard((p) => ({ ...p, [f]: e.target.value }))

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    const ref = `BFY-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`
    const search = new URLSearchParams({ vehicle: vehicleId, from, to, date, ref, name: passengerName })
    router.push(`/${locale}/rides/confirmed?${search.toString()}`)
  }

  const methods: { id: PaymentMethod; label: string; desc: string; icon: string }[] = [
    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Verve', icon: 'credit_card' },
    { id: 'mobile-money', label: 'Mobile Money', desc: 'MTN MoMo, Orange Money, T-Money', icon: 'smartphone' },
    { id: 'bank-transfer', label: 'Bank Transfer', desc: 'Direct wire transfer for corporate bookings', icon: 'account_balance' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 max-w-[1280px] mx-auto px-4 md:px-10 py-10">

        {/* Back link */}
        <Link
          href={`/${locale}/rides/book?vehicle=${vehicleId}&from=${from}&to=${to}&date=${date}`}
          className="inline-flex items-center gap-1.5 text-on-surface-variant text-label-md hover:text-primary mb-8 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Passenger Details
        </Link>

        {/* Progress stepper */}
        <div className="flex items-center mb-10 max-w-lg">
          {([
            { n: 1, label: 'Search', done: true },
            { n: 2, label: 'Details', done: true },
            { n: 3, label: 'Payment', active: true },
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

        <form onSubmit={handlePay}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: payment methods */}
            <div className="lg:col-span-7 space-y-5">
              <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
                <h1 className="text-headline-md text-primary mb-6">Payment Method</h1>

                <div className="space-y-4">
                  {methods.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${method === m.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50'}`}
                    >
                      <div className="flex items-start gap-4">
                        <span className={`material-symbols-outlined text-[22px] mt-0.5 ${method === m.id ? 'text-primary icon-fill' : 'text-outline'}`}>
                          {method === m.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-headline-sm">{m.label}</span>
                            <span className="material-symbols-outlined text-outline text-[20px]">{m.icon}</span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant">{m.desc}</p>

                          {/* Card form */}
                          {m.id === 'card' && method === 'card' && (
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-label-sm text-on-surface-variant mb-1">Card Number</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={card.number}
                                    onChange={setCardField('number')}
                                    placeholder="**** **** **** ****"
                                    maxLength={19}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:outline-none pr-10"
                                  />
                                  <span className="absolute right-3 top-3 material-symbols-outlined text-outline text-[20px]">lock</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-label-sm text-on-surface-variant mb-1">Expiry Date</label>
                                <input
                                  type="text"
                                  value={card.expiry}
                                  onChange={setCardField('expiry')}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-label-sm text-on-surface-variant mb-1">CVC/CVV</label>
                                <input
                                  type="password"
                                  value={card.cvv}
                                  onChange={setCardField('cvv')}
                                  placeholder="***"
                                  maxLength={4}
                                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* Mobile money info */}
                          {m.id === 'mobile-money' && method === 'mobile-money' && (
                            <div className="mt-4 p-4 bg-surface-container-low rounded-lg">
                              <p className="text-body-sm text-on-surface-variant">After confirming, you'll receive a payment prompt on your mobile number. Supports MTN MoMo, Orange Money, and T-Money.</p>
                            </div>
                          )}

                          {/* Bank transfer info */}
                          {m.id === 'bank-transfer' && method === 'bank-transfer' && (
                            <div className="mt-4 p-4 bg-surface-container-low rounded-lg space-y-2">
                              <p className="text-label-md">Beninfy Corporate Account</p>
                              <div className="flex justify-between text-body-sm">
                                <span className="text-on-surface-variant">Bank</span>
                                <span>Zenith Bank Nigeria</span>
                              </div>
                              <div className="flex justify-between text-body-sm">
                                <span className="text-on-surface-variant">Account No.</span>
                                <span className="font-mono">2089471234</span>
                              </div>
                              <div className="flex justify-between text-body-sm">
                                <span className="text-on-surface-variant">Sort Code</span>
                                <span className="font-mono">057</span>
                              </div>
                              <p className="text-label-sm text-secondary mt-2">Use your booking reference as payment description after completing.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-outline-variant">
                  {[
                    { icon: 'verified_user', label: 'SSL Encrypted' },
                    { icon: 'security', label: 'PCI-DSS Compliant' },
                    { icon: 'gpp_good', label: 'Secure Checkout' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full">
                      <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                      <span className="text-label-sm text-primary">{label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT: booking summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-outline-variant">
                  <h2 className="text-headline-sm mb-5">Ride Summary</h2>

                  {/* Vehicle image + route */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-[40px]">airport_shuttle</span>
                    </div>
                    <div>
                      <p className="text-label-md">{vehicle.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{from} → {to}</p>
                      {date && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-primary text-[14px]">calendar_today</span>
                          <span className="text-label-sm text-on-surface-variant">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-3 py-4 border-y border-outline-variant mb-5">
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Ride Fare</span>
                      <span>{formatNGN(basePrice ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        Border Protocol Fees
                        <span className="material-symbols-outlined text-[14px] text-outline cursor-help" title="Beninfy handles all border facilitation">info</span>
                      </span>
                      <span>{formatNGN(borderFee)}</span>
                    </div>
                    <div className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">Service Fee (5%)</span>
                      <span>{formatNGN(serviceFee)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-headline-sm">Total Amount</span>
                    <span className="text-headline-sm text-secondary">{formatNGN(total)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-primary text-on-primary py-4 rounded-xl text-label-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-lg disabled:opacity-70 disabled:cursor-wait"
                  >
                    {processing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        Processing…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined icon-fill text-[20px]">lock</span>
                        Pay Securely {formatNGN(total)}
                      </>
                    )}
                  </button>

                  <p className="text-center text-body-sm text-on-surface-variant mt-3">
                    By clicking "Pay Securely" you agree to our{' '}
                    <Link href={`/${locale}/terms`} className="text-primary hover:underline">Terms of Service</Link>
                  </p>
                </section>

                {/* Guarantee */}
                <div className="bg-secondary-container/10 p-4 rounded-xl border border-secondary/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary icon-fill text-[20px] shrink-0">verified</span>
                  <div>
                    <p className="text-label-md text-on-secondary-container">Beninfy Guarantee</p>
                    <p className="text-body-sm text-on-surface-variant">All payments are held in escrow until your journey is completed successfully. 24/7 dedicated support included.</p>
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

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span></div>}>
      <PaymentContent />
    </Suspense>
  )
}

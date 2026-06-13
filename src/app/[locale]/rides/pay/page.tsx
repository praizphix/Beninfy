'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { routes } from '@/data/routes'
import { getRouteBasePrice } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import { useVehicles } from '@/hooks/useVehicles'
import JourneyTracker from '@/components/booking/JourneyTracker'
import CountUp from 'react-countup'
import type { VehicleId, RouteId } from '@/types'

type PaymentMethod = 'card' | 'mobile-money' | 'bank-transfer'

function PaymentContent() {
  const locale = useLocale()
  const t = useTranslations('payPage')
  const router = useRouter()
  const params = useSearchParams()
  const { vehicles } = useVehicles()

  const vehicleId = (params.get('vehicle') ?? 'saloon') as VehicleId
  const from = params.get('from') ?? 'Lagos'
  const to = params.get('to') ?? 'Cotonou'
  const date = params.get('date') ?? ''
  const returnDate = params.get('returnDate') ?? ''
  const tripType = params.get('tripType') === 'round-trip' ? 'round-trip' : 'one-way'
  const passengerName = params.get('name') ?? 'Passenger'
  const passengerEmail = params.get('email') ?? ''
  const passengerPhone = params.get('phone') ?? ''
  const passportId = params.get('passportId') ?? ''
  const passengers = Math.max(1, parseInt(params.get('passengers') ?? '1', 10) || 1)

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const basePrice = matchedRoute ? getRouteBasePrice(matchedRoute.id as RouteId) : (vehicle?.basePriceNGN ?? 120000)

  const legCount = tripType === 'round-trip' ? 2 : 1
  const rideFare = (basePrice ?? 0) * legCount
  const borderFee = 5000 * legCount
  const serviceFee = Math.round(rideFare * 0.05)
  const total = rideFare + borderFee + serviceFee

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const setCardField = (f: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCard((p) => ({ ...p, [f]: e.target.value }))

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setErrorMsg(null)
    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          returnDate: returnDate ? new Date(returnDate).toISOString() : undefined,
          tripType,
          vehicleId,
          passengers,
          priceNGN: total,
          passengerName,
          passengerEmail,
          passengerPhone,
          passportId,
        }),
      })
      if (bookingRes.status === 401) {
        router.replace(`/${locale}/login`)
        return
      }
      if (!bookingRes.ok) {
        const data = await bookingRes.json().catch(() => ({}))
        throw new Error(data.error ?? 'Could not create booking')
      }
      const { booking } = (await bookingRes.json()) as { booking: { id: string } }

      const payRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, locale, passengerName }),
      })
      const payData = await payRes.json().catch(() => ({}))
      if (!payRes.ok) throw new Error(payData.error ?? 'Payment init failed')

      if (payData.mode === 'paystack' && payData.authorization_url) {
        window.location.assign(payData.authorization_url as string)
        return
      }

      const search = new URLSearchParams({
        id: booking.id,
        ref: payData.reference,
        name: passengerName,
      })
      router.push(`/${locale}/rides/confirmed?${search.toString()}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setProcessing(false)
    }
  }

  const methods: { id: PaymentMethod; label: string; desc: string; icon: string }[] = [
    { id: 'card', label: t('methodCard'), desc: t('methodCardDesc'), icon: 'credit_card' },
    { id: 'mobile-money', label: t('methodMobile'), desc: t('methodMobileDesc'), icon: 'smartphone' },
    { id: 'bank-transfer', label: t('methodBank'), desc: t('methodBankDesc'), icon: 'account_balance' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f4f2f8' }}>
      <div className="pt-20 pb-12 md:pt-24 md:pb-20 max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Back link */}
        <Link
          href={`/${locale}/rides/book?vehicle=${vehicleId}&from=${from}&to=${to}&date=${date}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-4 md:mb-6 group transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          {t('back')}
        </Link>

        {/* Road journey tracker */}
        <JourneyTracker steps={[
          { n: 1, label: t('stepSearch'), done: true },
          { n: 2, label: t('stepDetails'), done: true },
          { n: 3, label: t('stepPayment'), active: true },
          { n: 4, label: t('stepConfirmed') },
        ]} />

        <form onSubmit={handlePay}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: payment methods */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
                <h1 className="text-lg md:text-xl font-bold mb-5 md:mb-6" style={{ color: '#3e004c' }}>{t('paymentMethod')}</h1>

                <div className="space-y-4">
                  {methods.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`rounded-xl border-2 p-3.5 md:p-4 cursor-pointer transition-all ${method === m.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50 hover:border-primary/40'}`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                          <span className={`material-symbols-outlined text-[22px] mt-0.5 ${method === m.id ? 'text-primary' : 'text-gray-300'}`}>
                            {method === m.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center gap-3 mb-1">
                              <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                              <span className="material-symbols-outlined text-gray-400 text-[20px]">{m.icon}</span>
                            </div>
                            <p className="text-xs text-gray-500">{m.desc}</p>
                          {/* Card form */}
                          {m.id === 'card' && method === 'card' && (
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('cardNumber')}</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={card.number}
                                    onChange={setCardField('number')}
                                    placeholder="**** **** **** ****"
                                    maxLength={19}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 transition-all"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('cardExpiry')}</label>
                                <input
                                  type="text"
                                  value={card.expiry}
                                  onChange={setCardField('expiry')}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('cardCVC')}</label>
                                <input
                                  type="password"
                                  value={card.cvv}
                                  onChange={setCardField('cvv')}
                                  placeholder="***"
                                  maxLength={4}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                              </div>
                            </div>
                          )}

                          {/* Mobile money info */}
                          {m.id === 'mobile-money' && method === 'mobile-money' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">{t('mobileInfo')}</p>
                            </div>
                          )}

                          {/* Bank transfer info */}
                          {m.id === 'bank-transfer' && method === 'bank-transfer' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                              <p className="text-xs font-semibold text-gray-900">{t('bankTitle')}</p>
                              {[[t('bankLabel'), 'Zenith Bank Nigeria'], [t('accountLabel'), '2089471234'], [t('sortLabel'), '057']].map(([label, val]) => (
                                <div key={label} className="flex justify-between text-xs">
                                  <span className="text-gray-400">{label}</span>
                                  <span className="font-mono text-gray-900">{val}</span>
                                </div>
                              ))}
                              <p className="text-xs mt-2" style={{ color: '#735c00' }}>{t('bankRef')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  {[
                    { icon: 'verified_user', label: t('sslBadge') },
                    { icon: 'security', label: t('pciDss') },
                    { icon: 'gpp_good', label: t('secureCheckout') },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5">
                      <span className="material-symbols-outlined text-[16px]" style={{ color: '#3e004c' }}>{icon}</span>
                      <span className="text-xs font-medium" style={{ color: '#3e004c' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: booking summary */}
            <div className="lg:col-span-5">
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-4 md:px-6" style={{ background: '#3e004c' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">{t('rideSummary')}</p>
                  </div>
                  <div className="p-4 md:p-6 space-y-5">
                  {/* Vehicle + route */}
                  <div className="flex gap-4 mb-2">
                    <div className="w-20 h-14 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: '#f3e8f8' }}>
                      <span className="material-symbols-outlined text-[32px]" style={{ color: '#3e004c' }}>airport_shuttle</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{vehicle?.name ?? vehicleId}</p>
                      <p className="text-xs text-gray-500">{from} → {to}</p>
                      {tripType === 'round-trip' && <p className="text-xs text-gray-500">{to} → {from}</p>}
                      {date && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                      {tripType === 'round-trip' && returnDate && (
                        <p className="text-xs text-gray-400 mt-0.5">Return: {new Date(returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2.5 py-4 border-y border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('rideFare')}</span>
                      <span className="font-medium text-gray-900">₦<CountUp end={rideFare} separator="," duration={1.2} /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('borderFee')}</span>
                      <span className="font-medium text-gray-900">₦<CountUp end={borderFee} separator="," duration={1.2} /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('serviceFee')}</span>
                      <span className="font-medium text-gray-900">₦<CountUp end={serviceFee} separator="," duration={1.2} /></span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{t('totalAmount')}</span>
                    <span className="font-bold text-base" style={{ color: '#735c00' }}>₦<CountUp end={total} separator="," duration={1.5} /></span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-wait"
                    style={{ background: '#3e004c' }}
                  >
                    {processing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        {t('processing')}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        {t('payButton')} {formatNGN(total)}
                      </>
                    )}
                  </button>

                  {errorMsg && (
                    <p className="text-xs text-red-500 text-center -mt-2">{errorMsg}</p>
                  )}

                  <p className="text-center text-xs text-gray-400 mt-2">
                    {t('termsNote')}{' '}
                    <Link href={`/${locale}/terms`} className="underline hover:text-primary">{t('termsLink')}</Link>
                  </p>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: '#fffdf0', borderColor: '#f0e6b0' }}>
                  <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 18, color: '#735c00' }}>verified</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#735c00' }}>{t('guarantee')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{t('guaranteeDesc')}</p>
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

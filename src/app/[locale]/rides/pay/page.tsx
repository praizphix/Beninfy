'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { routes } from '@/data/routes'
import { getRouteDropoffPrice, type LagosPickupArea } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import { useVehicles } from '@/hooks/useVehicles'
import JourneyTracker from '@/components/booking/JourneyTracker'
import CountUp from 'react-countup'
import type { VehicleId, RouteId } from '@/types'

type PaymentMethod = 'card' | 'mobile-money' | 'bank-transfer'
type PaymentCurrency = 'NGN' | 'XOF'

type PayazaCheckoutResponse = {
  type?: string
  data?: {
    transaction_reference?: string
  }
}

type PayazaCheckoutConfig = {
  merchant_key: string
  connection_mode: 'Live' | 'Test'
  checkout_amount: number
  currency_code: PaymentCurrency
  email_address: string
  first_name: string
  last_name: string
  phone_number: string
  transaction_reference: string
  country_code?: 'BEN'
  biller_name?: string
  virtual_account_configuration?: { expires_in_minutes: number }
  additional_details?: Record<string, string>
}

declare global {
  interface Window {
    PayazaCheckout?: {
      setup: (config: PayazaCheckoutConfig) => {
        setCallback: (callback: (response: PayazaCheckoutResponse) => void) => void
        setOnClose: (callback: () => void) => void
        showPopup: () => void
      }
    }
  }
}

function loadPayazaCheckoutScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.PayazaCheckout) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-payaza-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Payaza checkout')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout-v2.payaza.africa/js/v1/bundle.js'
    script.async = true
    script.defer = true
    script.dataset.payazaCheckout = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Payaza checkout'))
    document.head.appendChild(script)
  })
}

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
  const nationality = params.get('nationality') ?? ''
  const pickupAddress = params.get('pickupAddress') ?? ''
  const dropoffAddress = params.get('dropoffAddress') ?? ''
  const specialRequirements = params.get('specialRequirements') ?? ''
  const pickupAreaParam = params.get('pickupArea')
  const pickupArea = (pickupAreaParam === 'mainland' || pickupAreaParam === 'island' ? pickupAreaParam : undefined) as LagosPickupArea | undefined
  const passengers = Math.max(1, parseInt(params.get('passengers') ?? '1', 10) || 1)

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const dropoffFare = matchedRoute ? getRouteDropoffPrice(matchedRoute.id as RouteId, vehicleId, vehicle?.name, pickupArea) : (vehicle?.basePriceNGN ?? 120000)

  const legCount = tripType === 'round-trip' ? 2 : 1
  const rideFare = (dropoffFare ?? 0) * legCount
  const borderFee = 5000 * legCount
  const serviceFee = Math.round(rideFare * 0.05)
  const total = rideFare + borderFee + serviceFee
  const xofRate = Number(process.env.NEXT_PUBLIC_NGN_TO_XOF_RATE || 0)
  const xofTotal = Number.isFinite(xofRate) && xofRate > 0 ? Math.round(total * xofRate) : null

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>('NGN')
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const displayTotal = paymentCurrency === 'XOF' && xofTotal ? `CFA ${xofTotal.toLocaleString('en-US')}` : formatNGN(total)

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
          nationality,
          pickupAddress,
          dropoffAddress,
          specialRequirements,
          pickupArea,
        }),
      })
      if (bookingRes.status === 401) {
        setProcessing(false)
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
        body: JSON.stringify({
          bookingId: booking.id,
          locale,
          passengerName,
          passengerPhone,
          currencyCode: paymentCurrency,
        }),
      })
      const payData = await payRes.json().catch(() => ({}))
      if (!payRes.ok) throw new Error(payData.error ?? 'Payment init failed')

      if (payData.mode === 'payaza_checkout' && payData.checkout) {
        await loadPayazaCheckoutScript()
        if (!window.PayazaCheckout) throw new Error('Payaza checkout is unavailable')

        const checkout = window.PayazaCheckout.setup(payData.checkout as PayazaCheckoutConfig)
        checkout.setCallback(async (response) => {
          try {
            if (response.type !== 'success') {
              setErrorMsg(response.data?.transaction_reference ? 'Payment is pending. Please confirm from your dashboard.' : 'Payment was not completed.')
              return
            }

            const reference = response.data?.transaction_reference || payData.reference
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference, currencyCode: paymentCurrency }),
            })
            const verifyData = await verifyRes.json().catch(() => ({}))
            if (!verifyRes.ok || verifyData.payment?.status !== 'paid') {
              throw new Error(verifyData.error || verifyData.payment?.message || 'Payment verification is pending')
            }

            const search = new URLSearchParams({
              id: booking.id,
              ref: reference,
              name: passengerName,
              currencyCode: paymentCurrency,
            })
            router.push(`/${locale}/rides/confirmed?${search.toString()}`)
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Payment verification failed')
          } finally {
            setProcessing(false)
          }
        })
        checkout.setOnClose(() => {
          setProcessing(false)
        })
        checkout.showPopup()
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
          href={`/${locale}/rides/book?${new URLSearchParams({
            vehicle: vehicleId,
            from,
            to,
            date,
            returnDate,
            tripType,
            passengers: String(passengers),
            name: passengerName,
            email: passengerEmail,
            phone: passengerPhone,
            passportId,
            nationality,
            pickupAddress,
            dropoffAddress,
            specialRequirements,
            ...(pickupArea ? { pickupArea } : {}),
          }).toString()}`}
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
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 md:p-4">
                    <p className="text-xs font-semibold text-gray-900 mb-3">Payment currency</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['NGN', 'XOF'] as const).map((currency) => (
                        <button
                          key={currency}
                          type="button"
                          onClick={() => setPaymentCurrency(currency)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                            paymentCurrency === currency
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/40'
                          }`}
                        >
                          {currency === 'NGN' ? 'Naira (NGN)' : 'CFA (XOF)'}
                        </button>
                      ))}
                    </div>
                    {paymentCurrency === 'XOF' && !xofTotal && (
                      <p className="text-xs text-red-500 mt-2">CFA payments need NEXT_PUBLIC_NGN_TO_XOF_RATE and PAYAZA_NGN_TO_XOF_RATE configured.</p>
                    )}
                  </div>

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
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Card details are entered inside Payaza's secure hosted checkout.</p>
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
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs font-semibold text-gray-900">{t('bankTitle')}</p>
                              <p className="text-xs mt-2 text-gray-500">
                                Payaza will generate the secure bank transfer instructions inside checkout.
                              </p>
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
                      {pickupArea && (
                        <p className="text-xs text-gray-400 mt-0.5">Pickup zone: {pickupArea === 'mainland' ? 'Mainland' : 'Island'}</p>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2.5 py-4 border-y border-gray-100">
                    <p className="text-xs text-gray-500">
                      {tripType === 'round-trip'
                        ? 'Ride fare is calculated as drop-off fare x 2.'
                        : 'Ride fare is the selected one-way drop-off fare.'}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{tripType === 'round-trip' ? `${t('rideFare')} (drop-off x 2)` : `${t('rideFare')} (drop-off)`}</span>
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
                    <span className="font-bold text-base" style={{ color: '#735c00' }}>
                      {paymentCurrency === 'XOF' && xofTotal ? (
                        <>CFA <CountUp end={xofTotal} separator="," duration={1.5} /></>
                      ) : (
                        <>₦<CountUp end={total} separator="," duration={1.5} /></>
                      )}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4" style={{ background: '#fffdf0', borderColor: '#f0e6b0' }}>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined shrink-0 text-[20px]" style={{ color: '#735c00' }}>policy</span>
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#735c00' }}>Before you pay</p>
                        <ul className="space-y-1.5 text-xs leading-relaxed text-gray-600">
                          <li>One-way trips require full payment before confirmation and departure.</li>
                          <li>Late cancellations, under 24 hours before the trip, attract the full one-way trip cost as cancellation fee.</li>
                          <li>Refunds are reviewed by support and may be reduced by cancellation fees, payment provider charges, and logistics already committed.</li>
                        </ul>
                        <Link href={`/${locale}/terms`} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
                          Read full terms
                        </Link>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing || (paymentCurrency === 'XOF' && !xofTotal)}
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
                        {t('payButton')} {displayTotal}
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

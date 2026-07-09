'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { findRoute } from '@/data/routes'
import { getRouteDropoffPrice, type LagosPickupArea } from '@/data/pricing'
import { getRouteBorderFee } from '@/data/borderFees'
import { formatNGN } from '@/lib/utils'
import { useVehicles } from '@/hooks/useVehicles'
import { useFleetVehicles } from '@/hooks/useFleetVehicles'
import { useRoutePriceOverrides } from '@/hooks/useRoutePriceOverrides'
import JourneyTracker from '@/components/booking/JourneyTracker'
import CountUp from 'react-countup'
import type { VehicleId, RouteId } from '@/types'

type PaymentMethod = 'card' | 'mobile-money' | 'bank-transfer'

type PayOnUsPaymentMethod = 'card' | 'bank' | 'palmpay' | 'opay'

type PayOnUsCheckoutResult = {
  reference?: string
  onusReference?: string
  amount?: number
  method?: string
  status?: string
}

type PayOnUsCheckoutError = {
  error?: string
  code?: string
}

type PayOnUsCheckoutConfig = {
  businessId: string
  amount: number
  currency: 'NGN'
  customerEmail: string
  customerName: string
  customerPhone: string
  merchantCheckoutReference: string
  countryCode: 'NG'
  notificationUrl: string
  redirectUrl: string
  environment: 'test' | 'production'
  paymentMethods: PayOnUsPaymentMethod[]
  onSuccess: (result: PayOnUsCheckoutResult) => void
  onError: (error: PayOnUsCheckoutError) => void
  onClose: () => void
}

declare global {
  interface Window {
    OnUsCheckout?: {
      init: () => void
      checkout: (config: PayOnUsCheckoutConfig) => void
    }
  }
}

function loadPayOnUsCheckoutScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.OnUsCheckout) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-payonus-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load PayOnUs checkout')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://payonus.com/checkout-v2.min.js'
    script.async = true
    script.defer = true
    script.dataset.payonusCheckout = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load PayOnUs checkout'))
    document.head.appendChild(script)
  })
}

function PaymentContent() {
  const locale = useLocale()
  const t = useTranslations('payPage')
  const router = useRouter()
  const params = useSearchParams()
  const { vehicles } = useVehicles()
  const { fleetVehicles } = useFleetVehicles()

  const vehicleId = (params.get('vehicle') ?? 'saloon') as VehicleId
  const fleetVehicleId = params.get('fleetVehicle') || ''
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
  const fleetVehicle = fleetVehicles.find((unit) => unit.id === fleetVehicleId && unit.vehicleId === vehicleId)
  const matchedRoute = findRoute(from, to)
  const { overrides } = useRoutePriceOverrides(matchedRoute?.id)
  const dropoffFare = matchedRoute
    ? getRouteDropoffPrice(
        matchedRoute.id as RouteId,
        (fleetVehicle?.id ?? vehicleId) as VehicleId,
        fleetVehicle?.label ?? vehicle?.name,
        pickupArea,
        overrides
      )
    : (vehicle?.basePriceNGN ?? 120000)

  const legCount = tripType === 'round-trip' ? 2 : 1
  const rideFare = (dropoffFare ?? 0) * legCount
  const borderFee = matchedRoute ? getRouteBorderFee(matchedRoute.id as RouteId, tripType) : 0
  const total = rideFare + borderFee

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const displayTotal = formatNGN(total)

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
          fleetVehicleId: fleetVehicle?.id,
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
          currencyCode: 'NGN',
        }),
      })
      const payData = await payRes.json().catch(() => ({}))
      if (!payRes.ok) throw new Error(payData.error ?? 'Payment init failed')

      if (payData.mode === 'payonus_checkout' && payData.checkout) {
        await loadPayOnUsCheckoutScript()
        if (!window.OnUsCheckout) throw new Error('PayOnUs checkout is unavailable')

        window.OnUsCheckout.init()
        window.OnUsCheckout.checkout({
          ...(payData.checkout as Omit<PayOnUsCheckoutConfig, 'onSuccess' | 'onError' | 'onClose'>),
          paymentMethods:
            method === 'card' ? ['card'] :
            method === 'bank-transfer' ? ['bank', 'palmpay', 'opay'] :
            ['palmpay', 'opay'],
          onSuccess: async (response) => {
            try {
              const reference = response.reference || payData.reference
              const providerReference = response.onusReference
              if (!providerReference) throw new Error('PayOnUs did not return a payment reference')

              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, providerReference }),
              })
              const verifyData = await verifyRes.json().catch(() => ({}))
              if (!verifyRes.ok || verifyData.payment?.status !== 'paid') {
                throw new Error(verifyData.error || verifyData.payment?.message || 'Payment verification is pending')
              }

              const search = new URLSearchParams({
                id: booking.id,
                ref: reference,
                providerRef: providerReference,
                name: passengerName,
                currencyCode: 'NGN',
              })
              router.push(`/${locale}/rides/confirmed?${search.toString()}`)
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Payment verification failed')
            } finally {
              setProcessing(false)
            }
          },
          onError: (error) => {
            setErrorMsg(error.error || 'Payment failed')
            setProcessing(false)
          },
          onClose: () => {
            setProcessing(false)
          },
        })
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
    { id: 'card', label: 'Card', desc: 'Pay securely with Visa, Mastercard, or Verve through PayOnUs.', icon: 'credit_card' },
    { id: 'bank-transfer', label: 'Bank transfer', desc: 'Pay into a generated Naira virtual account.', icon: 'account_balance' },
    { id: 'mobile-money', label: 'PalmPay / Opay', desc: 'Complete payment through PalmPay or Opay from PayOnUs checkout.', icon: 'smartphone' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f4f2f8' }}>
      <div className="pt-20 pb-12 md:pt-24 md:pb-20 max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Back link */}
        <Link
          href={`/${locale}/rides/book?${new URLSearchParams({
            vehicle: vehicleId,
            fleetVehicle: fleetVehicle?.id ?? '',
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
                    <p className="text-xs font-semibold text-gray-900">Naira collection via PayOnUs</p>
                    <p className="mt-1 text-xs text-gray-500">Supports card, bank transfer, PalmPay, and Opay checkout options in NGN.</p>
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
                              <p className="text-xs text-gray-500">Card details are entered inside PayOnUs&apos; secure hosted checkout.</p>
                            </div>
                          )}

                          {/* Mobile money info */}
                          {m.id === 'mobile-money' && method === 'mobile-money' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">PayOnUs will open PalmPay and Opay options inside checkout.</p>
                            </div>
                          )}

                          {/* Bank transfer info */}
                          {m.id === 'bank-transfer' && method === 'bank-transfer' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                              <p className="text-xs font-semibold text-gray-900">{t('bankTitle')}</p>
                              <p className="text-xs mt-2 text-gray-500">
                                PayOnUs will generate secure bank transfer instructions inside checkout.
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
                      <p className="text-sm font-semibold text-gray-900">{fleetVehicle?.label ?? vehicle?.name ?? vehicleId}</p>
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
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{t('totalAmount')}</span>
                    <span className="font-bold text-base" style={{ color: '#735c00' }}>
                      ₦<CountUp end={total} separator="," duration={1.5} />
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

'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { routes } from '@/data/routes'
import { getRouteBasePrice } from '@/data/pricing'
import { useVehicles } from '@/hooks/useVehicles'
import JourneyTracker from '@/components/booking/JourneyTracker'
import RouteMapSVG from '@/components/shared/RouteMapSVG'
import CountUp from 'react-countup'
import type { VehicleId, RouteId } from '@/types'

const INPUT_BASE =
  'w-full bg-white border rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all'
const INPUT_OK = INPUT_BASE + ' border-gray-200 focus:border-primary focus:ring-primary/20'
const INPUT_ERR = INPUT_BASE + ' border-red-400 focus:border-red-500 focus:ring-red-200'

function PassengerDetailsContent() {
  const locale = useLocale()
  const t = useTranslations('bookPage')
  const router = useRouter()
  const params = useSearchParams()
  const { vehicles } = useVehicles()

  const vehicleId = (params.get('vehicle') ?? 'saloon') as VehicleId
  const from = params.get('from') ?? 'Lagos'
  const to = params.get('to') ?? 'Cotonou'
  const date = params.get('date') ?? ''
  const returnDate = params.get('returnDate') ?? ''
  const tripType = params.get('tripType') === 'round-trip' ? 'round-trip' : 'one-way'

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const basePrice = matchedRoute ? getRouteBasePrice(matchedRoute.id as RouteId) : null

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', passportId: '',
    nationality: '', specialRequirements: '', pickupAddress: '', dropoffAddress: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.passportId.trim()) e.passportId = 'Required for border crossing'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (tripType === 'round-trip' && !returnDate) return
    const passengers = params.get('passengers') ?? '1'
    const search = new URLSearchParams({
      vehicle: vehicleId, from, to, date, returnDate, tripType, passengers,
      price: String(total),
      name: form.fullName, email: form.email, phone: form.phone,
      passportId: form.passportId,
    })
    router.push(`/${locale}/rides/pay?${search.toString()}`)
  }

  const legCount = tripType === 'round-trip' ? 2 : 1
  const rideFare = (basePrice ?? 0) * legCount
  const borderProtocolFee = 5000 * legCount
  const serviceFee = rideFare ? Math.round(rideFare * 0.05) : 0
  const total = rideFare + borderProtocolFee + serviceFee

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const formattedReturnDate = returnDate
    ? new Date(returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen" style={{ background: '#f4f2f8' }}>
      <div className="pt-20 pb-12 md:pt-24 md:pb-20 max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Back */}
        <Link
          href={`/${locale}/rides`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-4 md:mb-6 group transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Back to Rides
        </Link>

        {/* Road journey tracker */}
        <JourneyTracker steps={[
          { n: 1, label: t('stepSearch'), done: true },
          { n: 2, label: t('stepDetails'), active: true },
          { n: 3, label: t('stepPayment') },
          { n: 4, label: t('stepConfirmed') },
        ]} />

        {/* Title */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#3e004c' }}>{t('pageTitle')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('pageSubtitle')}</p>
        </motion.div>

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT */}
            <motion.div
              className="lg:col-span-8 space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              {/* Passenger info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f3e8f8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3e004c' }}>person</span>
                  </div>
                  <h2 className="font-semibold text-gray-900">{t('passengerInfo')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'fullName', label: t('fieldName'), placeholder: t('fieldNamePlaceholder'), type: 'text' },
                    { id: 'email', label: t('fieldEmail'), placeholder: t('fieldEmailPlaceholder'), type: 'email' },
                    { id: 'phone', label: t('fieldPhone'), placeholder: t('fieldPhonePlaceholder'), type: 'tel' },
                    { id: 'passportId', label: t('fieldPassport'), placeholder: t('fieldPassportPlaceholder'), type: 'text' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                      <input
                        type={type}
                        value={form[id as keyof typeof form]}
                        onChange={set(id as keyof typeof form)}
                        placeholder={placeholder}
                        className={errors[id as keyof typeof form] ? INPUT_ERR : INPUT_OK}
                      />
                      {errors[id as keyof typeof form] && (
                        <p className="text-xs text-red-500 mt-1">{errors[id as keyof typeof form]}</p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('fieldNationality')}</label>
                    <select value={form.nationality} onChange={set('nationality')} className={INPUT_OK}>
                      <option value="">{t('fieldNationalityPlaceholder')}</option>
                      {[
                        t('nationalityNigerian'),
                        t('nationalityBeninese'),
                        t('nationalityTogolese'),
                        t('nationalityGhanaian'),
                        t('nationalityOther'),
                      ].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Special Requirements <span className="text-gray-400 font-normal">{t('fieldSpecialOptional')}</span>
                    </label>
                    <textarea
                      value={form.specialRequirements}
                      onChange={set('specialRequirements')}
                      placeholder={t('fieldSpecialPlaceholder')}
                      rows={3}
                      className={INPUT_OK + ' resize-none'}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup & drop-off card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f3e8f8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3e004c' }}>location_on</span>
                  </div>
                  <h2 className="font-semibold text-gray-900">{t('pickupDropoff')}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {t('pickupLabel')} <span className="text-primary font-semibold">{from}</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: 18, color: '#3e004c' }}>radio_button_checked</span>
                      <input
                        type="text"
                        value={form.pickupAddress}
                        onChange={set('pickupAddress')}
                        placeholder={t('addressPlaceholder')}
                        className={INPUT_OK + ' pl-10'}
                      />
                    </div>
                  </div>

                  {/* Visual connector */}
                  <div className="ml-4 h-5 w-px bg-gray-200" />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {t('dropoffLabel')} <span className="font-semibold" style={{ color: '#735c00' }}>{to}</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: 18, color: '#735c00' }}>location_on</span>
                      <input
                        type="text"
                        value={form.dropoffAddress}
                        onChange={set('dropoffAddress')}
                        placeholder={t('dropoffPlaceholder')}
                        className={INPUT_OK + ' pl-10'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Border protocol notice */}
              <div className="rounded-2xl p-4 md:p-5 border flex gap-3 md:gap-4 items-start" style={{ background: '#fdf5ff', borderColor: '#e4c8f0' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ead5f5' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3e004c' }}>verified_user</span>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#3e004c' }}>{t('borderNoticeTitle')}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('borderNoticeDesc')}
                  </p>
                </div>
              </div>

              {/* Mobile submit */}
              <button
                type="submit"
                className="lg:hidden w-full py-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                style={{ background: '#3e004c' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                {t('continuePayment')}
              </button>
            </motion.div>

            {/* RIGHT — Summary */}
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            >
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header strip */}
                  <div className="px-4 py-4 md:px-6" style={{ background: '#3e004c' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">{t('summaryTitle')}</p>
                  </div>

                  <div className="p-4 md:p-6 space-y-5">
                    {/* Animated route map */}
                    <RouteMapSVG from={from} to={to} duration="~6 hrs" distance="~140 km" />

                    <div className="border-t border-gray-100" />

                    {/* Vehicle */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f3e8f8' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3e004c' }}>airport_shuttle</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vehicle?.name ?? vehicleId}</p>
                        <p className="text-xs text-gray-500">{vehicle?.capacity ?? '—'} passengers • {tripType}</p>
                      </div>
                    </div>

                    {/* Date */}
                    {formattedDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f3e8f8' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3e004c' }}>calendar_month</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                      </div>
                    )}

                    {tripType === 'round-trip' && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f3e8f8' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3e004c' }}>event_repeat</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{formattedReturnDate ?? 'Return date required'}</p>
                      </div>
                    )}

                    {/* Price breakdown */}
                    {basePrice && (
                      <>
                        <div className="border-t border-gray-100" />
                        <div className="space-y-2.5">
                          {[
                            { label: t('rideFare'), value: rideFare },
                            { label: t('borderFee'), value: borderProtocolFee },
                            { label: t('serviceFee'), value: serviceFee },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span className="text-gray-500">{label}</span>
                              <span className="text-gray-900 font-medium">
                                ₦<CountUp end={value} separator="," duration={1.2} />
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-3 border-t border-gray-200">
                            <span className="font-bold text-gray-900">{t('total')}</span>
                            <span className="font-bold text-base" style={{ color: '#735c00' }}>
                              ₦<CountUp end={total} separator="," duration={1.5} />
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Desktop CTA */}
                    <button
                      type="submit"
                      className="hidden lg:flex w-full py-4 rounded-xl text-sm font-semibold text-white items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
                      style={{ background: '#3e004c' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                    {t('continuePayment')}
                    </button>
                  </div>
                </div>

                {/* Guarantee badge */}
                <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background: '#fffdf0', borderColor: '#f0e6b0' }}>
                  <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 18, color: '#735c00' }}>verified</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#735c00' }}>{t('guarantee')}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{t('guaranteeDesc')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default function PassengerDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f2f8' }}>
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[40px]" style={{ color: '#3e004c' }}>progress_activity</span>
          <p className="text-sm text-gray-500">Loading your booking...</p>
        </div>
      </div>
    }>
      <PassengerDetailsContent />
    </Suspense>
  )
}

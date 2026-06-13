'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { routes, bookingCities } from '@/data/routes'
import { routePricing } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import { useVehicles } from '@/hooks/useVehicles'
import type { VehicleId, RouteId } from '@/types'
import CatalogImage from '@/components/shared/CatalogImage'

const VEHICLE_BADGES: Partial<Record<VehicleId, { text: string; cls: string }>> = {
  saloon: { text: 'Popular', cls: 'bg-primary/90 text-white' },
  sienna: { text: 'Best for Families', cls: 'bg-secondary-container text-on-secondary-container' },
  prado: { text: 'VIP Security', cls: 'bg-primary/90 text-white' },
  sprinter: { text: 'Corporate', cls: 'bg-primary/90 text-white' },
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span></div>}>
      <RidesContent />
    </Suspense>
  )
}

function RidesContent() {
  const locale = useLocale()
  const t = useTranslations('ridesPage')
  const searchParams = useSearchParams()
  const { vehicles } = useVehicles()
  const [from, setFrom] = useState(searchParams.get('from') ?? 'Lagos')
  const [to, setTo] = useState(searchParams.get('to') ?? 'Cotonou')
  const [date, setDate] = useState(searchParams.get('date') ?? '')
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') ?? '')
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    searchParams.get('tripType') === 'round-trip' ? 'round-trip' : 'one-way'
  )
  const [passengers, setPassengers] = useState<number>(
    Math.max(1, parseInt(searchParams.get('passengers') ?? '1', 10) || 1)
  )
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleId[]>(
    searchParams.get('vehicle') ? [searchParams.get('vehicle') as VehicleId] : []
  )

  const today = new Date().toISOString().split('T')[0]

  const matchedRoute = routes.find(
    (r) => r.from === from && r.to === to
  )

  const toggleVehicle = (id: VehicleId) =>
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )

  const displayVehicles = vehicles.filter((v) => {
    if (selectedVehicles.length === 0) return true
    return selectedVehicles.includes(v.id)
  })

  const getPriceForVehicle = (vehicleId: VehicleId) => {
    if (!matchedRoute) return null
    const pricing = routePricing[matchedRoute.id as RouteId]
    if (!pricing) return null
    const price = pricing[vehicleId]
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!price) return vehicle?.basePriceNGN ? formatNGN(vehicle.basePriceNGN) : null
    if (typeof price === 'number') return formatNGN(price)
    return `${formatNGN(price.min)} – ${formatNGN(price.max)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 mt-16">
        {/* Breadcrumb + header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-label-md mb-3">
            <Link href={`/${locale}`} className="hover:text-primary">{t('breadcrumbHome')}</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span>{t('breadcrumbRides')}</span>
            {matchedRoute && (
              <>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span>{t('breadcrumbResults')}</span>
              </>
            )}
          </div>
          <h1 className="text-display-lg text-primary">
            {matchedRoute ? `${matchedRoute.from} to ${matchedRoute.to}` : t('pageTitle')}
          </h1>
          {matchedRoute && (
            <p className="text-on-surface-variant text-body-md mt-1">
              {t('tagline')} • {t('estDuration')}: {matchedRoute.durationHours}h
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Filters sidebar */}
          <aside className="lg:col-span-3 bg-surface-container-low p-6 rounded-2xl space-y-8 lg:sticky lg:top-24">
            {/* Route search */}
            <div>
              <h3 className="text-label-md text-primary mb-4">{t('labelRoute')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Trip type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['one-way', 'round-trip'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTripType(type)}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                          tripType === type ? 'bg-primary text-white' : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        {type === 'one-way' ? 'One way' : 'Round trip'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">{t('labelFrom')}</label>
                  <div className="flex items-center gap-2 border border-outline-variant rounded-lg p-2.5 focus-within:border-primary bg-surface-container-lowest transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <select
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-body-sm outline-none"
                    >
                      {bookingCities.map((c) => (
                        <option key={c.code} value={c.city}>{c.city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">{t('labelTo')}</label>
                  <div className="flex items-center gap-2 border border-outline-variant rounded-lg p-2.5 focus-within:border-primary bg-surface-container-lowest transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
                    <select
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-body-sm outline-none"
                    >
                      {bookingCities.map((c) => (
                        <option key={c.code} value={c.city}>{c.city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">{t('labelDate')}</label>
                  <div className="flex items-center gap-2 border border-outline-variant rounded-lg p-2.5 focus-within:border-primary bg-surface-container-lowest transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => {
                        setDate(e.target.value)
                        if (returnDate && returnDate < e.target.value) setReturnDate('')
                      }}
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-body-sm outline-none"
                    />
                  </div>
                </div>
                {tripType === 'round-trip' && (
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-1 block">Return date</label>
                    <div className="flex items-center gap-2 border border-outline-variant rounded-lg p-2.5 focus-within:border-primary bg-surface-container-lowest transition-colors">
                      <span className="material-symbols-outlined text-primary text-[18px]">event_repeat</span>
                      <input
                        type="date"
                        value={returnDate}
                        min={date || today}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 w-full text-body-sm outline-none"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Passengers</label>
                  <div className="flex items-center gap-2 border border-outline-variant rounded-lg p-2.5 focus-within:border-primary bg-surface-container-lowest transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={passengers}
                      onChange={(e) => setPassengers(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-body-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle type filter */}
            <div>
              <h3 className="text-label-md text-primary mb-4">{t('labelVehicle')}</h3>
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <label key={v.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(v.id)}
                      onChange={() => toggleVehicle(v.id)}
                      className="w-4 h-4 rounded border-outline accent-primary"
                    />
                    <span className="text-body-sm">{v.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            {selectedVehicles.length > 0 && (
              <button
                onClick={() => setSelectedVehicles([])}
                className="w-full border border-primary text-primary py-3 rounded-xl text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                {t('resetFilters')}
              </button>
            )}
          </aside>

          {/* Results */}
          <div className="lg:col-span-9 space-y-6">
            {!matchedRoute && (
              <div className="bg-surface-container-low rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">route</span>
                <h3 className="text-headline-sm mb-2">{t('selectRoute')}</h3>
                <p className="text-on-surface-variant text-body-md">{t('selectRoutePlaceholder')}</p>
              </div>
            )}

            {displayVehicles.map((vehicle) => {
              const price = getPriceForVehicle(vehicle.id)
              if (matchedRoute && !price) return null
              const badge = VEHICLE_BADGES[vehicle.id]

              return (
                <div
                  key={vehicle.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="md:w-2/5 relative min-h-[200px] bg-surface-container overflow-hidden">
                    <CatalogImage
                      src={vehicle.image}
                      alt={vehicle.name}
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="w-full h-full object-cover"
                    />
                    {badge && (
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-label-sm ${badge.cls}`}>
                        {badge.text}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-headline-sm text-primary">{vehicle.name}</h2>
                        {price ? (
                          <span className="text-headline-sm text-secondary">{price}</span>
                        ) : (
                          <span className="text-label-sm text-on-surface-variant">{t('priceSelect')}</span>
                        )}
                      </div>
                      <p className="text-on-surface-variant text-body-sm mb-4">{vehicle.description}</p>
                      <div className="grid grid-cols-2 gap-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                          <span className="text-label-md">{vehicle.capacity} {t('passengers')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">luggage</span>
                          <span className="text-label-md">{vehicle.luggageCapacity} {t('bags')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">ac_unit</span>
                          <span className="text-label-md">{t('fullAC')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                          <span className="text-label-md">{t('borderProtocol')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/${locale}/rides/book?vehicle=${vehicle.id}&from=${from}&to=${to}&date=${date}&returnDate=${returnDate}&tripType=${tripType}&passengers=${passengers}`}
                        className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-label-md text-center hover:opacity-95 active:scale-[0.98] transition-all"
                      >
                        {t('bookNow')}
                      </Link>
                      <Link
                        href={`/${locale}/fleet#${vehicle.id}`}
                        className="px-4 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">info</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

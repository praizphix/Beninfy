import Link from 'next/link'
import { vehicles } from '@/data/vehicles'
import { routes } from '@/data/routes'
import { getRouteBasePrice } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import type { VehicleId, RouteId } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    vehicle?: string
    from?: string
    to?: string
    date?: string
    ref?: string
    name?: string
  }>
}

export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams

  const vehicleId = (sp.vehicle ?? 'saloon') as VehicleId
  const from = sp.from ?? 'Lagos'
  const to = sp.to ?? 'Cotonou'
  const date = sp.date ?? ''
  const bookingRef = sp.ref ?? `BFY-${Math.floor(10000 + Math.random() * 90000)}-XP`
  const passengerName = sp.name ?? 'Passenger'

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0]
  const matchedRoute = routes.find((r) => r.from === from && r.to === to)
  const basePrice = matchedRoute ? getRouteBasePrice(matchedRoute.id as RouteId) : 120000
  const borderFee = 5000
  const serviceFee = Math.round((basePrice ?? 0) * 0.05)
  const total = (basePrice ?? 0) + borderFee + serviceFee

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date TBC'

  return (
    <div className="min-h-screen bg-background">
      <main className="mt-16 pb-24 relative overflow-hidden">
        {/* Celebration gradient */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-[860px] mx-auto px-4 md:px-6 py-12">
          {/* Success header */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-container rounded-full mb-6 shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-on-primary-container text-[48px] icon-fill">check_circle</span>
            </div>
            <h1 className="text-display-lg text-primary mb-3">Booking Confirmed!</h1>
            <p className="text-body-lg text-on-surface-variant">Thank you, {passengerName}. Beninfy's premium logistics service is on your side.</p>
            <div className="mt-5 inline-block bg-secondary-container px-6 py-2.5 rounded-full border border-secondary">
              <span className="text-label-md text-on-secondary-container">Reference: #{bookingRef}</span>
            </div>
          </section>

          {/* Main bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Trip summary card */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-7 shadow-sm border border-outline-variant flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h2 className="text-headline-md">Trip Summary</h2>
                <span className="bg-primary-container/30 text-primary px-3 py-1 rounded-lg text-label-sm uppercase tracking-wider">Premium Transit</span>
              </div>

              {/* Route display */}
              <div className="flex items-center gap-6 py-5 border-y border-outline-variant">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">radio_button_checked</span>
                  <div className="w-0.5 h-12 bg-outline-variant" />
                  <span className="material-symbols-outlined text-secondary icon-fill text-[20px]">location_on</span>
                </div>
                <div className="flex flex-col gap-5 w-full">
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">Pickup</p>
                    <p className="text-headline-sm">{from}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">Destination</p>
                    <p className="text-headline-sm">{to}</p>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] mb-2 block">calendar_month</span>
                  <p className="text-label-sm text-on-surface-variant">Date & Time</p>
                  <p className="text-label-md mt-1">{formattedDate}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] mb-2 block">airport_shuttle</span>
                  <p className="text-label-sm text-on-surface-variant">Vehicle Class</p>
                  <p className="text-label-md mt-1">{vehicle.name}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 col-span-2 md:col-span-1">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] mb-2 block">payments</span>
                  <p className="text-label-sm text-on-surface-variant">Total Paid</p>
                  <p className="text-label-md text-secondary mt-1">{formatNGN(total)}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-body-sm pt-1 border-t border-outline-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ride Fare</span>
                  <span>{formatNGN(basePrice ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Border Protocol Fee</span>
                  <span>{formatNGN(borderFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Service Fee</span>
                  <span>{formatNGN(serviceFee)}</span>
                </div>
              </div>
            </div>

            {/* What's next card */}
            <div className="md:col-span-4 bg-primary text-on-primary rounded-2xl p-7 shadow-lg flex flex-col gap-5">
              <h3 className="text-headline-sm">What's Next?</h3>
              <p className="text-body-md opacity-90">
                Our team will contact you within <strong className="text-secondary-fixed">2 hours</strong> to finalize your personalized pickup details and border clearance protocols.
              </p>
              <div className="mt-auto pt-5 flex flex-col gap-4 border-t border-on-primary/20">
                {[
                  { icon: 'verified_user', text: 'Driver vetting complete' },
                  { icon: 'health_and_safety', text: 'Sanitized vehicle ready' },
                  { icon: 'support_agent', text: '24/7 concierge support' },
                  { icon: 'security', text: 'Border clearance pre-arranged' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary-fixed text-[18px]">{icon}</span>
                    <p className="text-label-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="md:col-span-12 flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={`/${locale}/dashboard`}
                className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary rounded-xl text-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Go to Dashboard
              </Link>
              <button
                onClick={() => window.print()}
                className="w-full md:w-auto px-8 py-4 bg-transparent text-secondary border-2 border-secondary rounded-xl text-label-md hover:bg-secondary-container/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download Receipt
              </button>
              <a
                href={`https://wa.me/2348000000000?text=My+Beninfy+booking+reference+is+%23${bookingRef}.+I+need+assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-8 py-4 bg-transparent text-on-surface-variant border-2 border-outline-variant rounded-xl text-label-md hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                WhatsApp Support
              </a>
            </div>
          </div>

          {/* Support footer */}
          <div className="mt-16 text-center">
            <p className="text-body-sm text-on-surface-variant mb-4">Need immediate assistance with your crossing?</p>
            <div className="flex items-center justify-center gap-6">
              <a href={`/${locale}/about#contact`} className="flex items-center gap-2 text-primary text-label-md hover:underline">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Contact Concierge
              </a>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <a href={`/${locale}/border-info`} className="flex items-center gap-2 text-primary text-label-md hover:underline">
                <span className="material-symbols-outlined text-[18px]">help_outline</span>
                Border FAQ
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

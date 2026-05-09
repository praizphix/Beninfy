import Link from 'next/link'
import { useLocale } from 'next-intl'
import { routes } from '@/data/routes'
import { getRouteBasePrice } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'

const ROUTE_IMAGES: Record<string, string> = {
  'lagos-cotonou':
    'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80',
  'cotonou-togo':
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=800&q=80',
  'togo-ghana':
    'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
  'lagos-togo':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
  'lagos-ghana':
    'https://images.unsplash.com/photo-1505155485412-30b3a45080ec?auto=format&fit=crop&w=800&q=80',
}

const ROUTE_BADGES: Record<string, string> = {
  'lagos-cotonou': 'Daily Departures',
  'cotonou-togo': 'Express Transit',
  'togo-ghana': 'Coastal Route',
  'lagos-togo': 'Multi-Border',
  'lagos-ghana': 'Long Haul Comfort',
}

const popularRoutes = routes.filter((r) => r.popular)

export default function PopularRoutes() {
  const locale = useLocale()
  return (
    <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10 mt-8">
      {/* Section header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="text-primary text-label-md tracking-widest uppercase">
            Travel Networks
          </span>
          <h2 className="text-headline-lg mt-2">Popular Cross-Border Routes</h2>
        </div>
        <Link
          href={`/${locale}/rides`}
          className="text-primary text-label-md flex items-center gap-1 hover:underline whitespace-nowrap"
        >
          View all routes
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* Routes grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {popularRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-outline-variant group"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden relative">
              <img
                src={ROUTE_IMAGES[route.id] ?? ROUTE_IMAGES['lagos-cotonou']}
                alt={`${route.from} to ${route.to}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-label-sm text-primary">
                {ROUTE_BADGES[route.id]}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-headline-sm">
                  {route.from} → {route.to}
                </h3>
                <span className="text-secondary text-headline-sm">
                  {formatNGN(getRouteBasePrice(route.id))}
                </span>
              </div>
              <p className="text-on-surface-variant text-body-sm mb-4">
                Duration: ~{route.durationHours}h &nbsp;|&nbsp; Private Premium Saloon
              </p>
              <Link
                href={`/${locale}/rides?from=${route.from}&to=${route.to}`}
                className="block w-full py-3 rounded-lg border border-primary text-primary text-label-md text-center hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                Book This Route
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

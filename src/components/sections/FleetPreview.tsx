import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { tourDailyRates } from '@/data/pricing'
import { formatNGN } from '@/lib/utils'
import { getPublicVehicles } from '@/lib/vehicleCatalog'

export default async function FleetPreview() {
  const locale = await getLocale()
  const t = await getTranslations('fleet')
  const previewVehicles = (await getPublicVehicles()).slice(0, 6)
  return (
    <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-primary text-label-md tracking-widest uppercase">{t('title')}</span>
        <h2 className="text-headline-lg mt-2">{t('sectionTitle')}</h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto text-body-md">
          {t('subtitle')}
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {[
          { icon: 'verified_user', labelKey: 'badgeVerified' },
          { icon: 'security', labelKey: 'badgeSecurity' },
          { icon: 'ac_unit', labelKey: 'badgeClimate' },
          { icon: 'wifi', labelKey: 'badgeConnectivity' },
        ].map(({ icon, labelKey }) => (
          <div
            key={labelKey}
            className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10"
          >
            <span className="material-symbols-outlined text-primary icon-fill text-[18px]">
              {icon}
            </span>
            <span className="text-label-md text-primary">{t(labelKey)}</span>
          </div>
        ))}
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewVehicles.map((v) => (
          <div
            key={v.id}
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="h-56 relative overflow-hidden bg-surface-container">
              <img
                src={v.image}
                alt={v.name}
                className="w-full h-full object-cover"
              />
              {v.badge && (
                <div className="absolute bottom-4 left-4 bg-primary/90 text-on-primary px-3 py-1 rounded-lg text-label-sm">
                  {v.badge}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-headline-sm">{v.name}</h3>
                <span className="text-secondary text-label-md">
                  {t('priceFrom')} {formatNGN(tourDailyRates[v.id] ?? 0)}{t('perDay')}
                </span>
              </div>
              <p className="text-on-surface-variant text-body-sm mb-4 flex-1">{v.description}</p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    person
                  </span>
                  <span className="text-label-md">{v.capacity} {t('passengers')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    luggage
                  </span>
                  <span className="text-label-md">{v.luggageCapacity} {t('bags')}</span>
                </div>
              </div>

              <Link
                href={`/${locale}/fleet#${v.id}`}
                className="block w-full border-2 border-secondary text-secondary py-3 rounded-xl text-label-md text-center hover:bg-secondary-container/20 transition-colors"
              >
                {t('viewDetails')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <Link
          href={`/${locale}/fleet`}
          className="inline-flex items-center gap-2 text-primary text-label-md hover:underline"
        >
          {t('viewAll')}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  )
}

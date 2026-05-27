import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { tours } from '@/data/tours'
import { formatNGN } from '@/lib/utils'

const TOUR_IMAGES: Record<string, string> = {
  'benin-history-lake':
    'https://images.unsplash.com/photo-1612890009000-b9a73c018c85?auto=format&fit=crop&w=800&q=80',
  'lome-aneho-beach':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'accra-cape-coast':
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
  'west-africa-grand-tour':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
}

const TOUR_TAG_KEYS: Record<string, string> = {
  'benin-history-lake': 'tagHistory',
  'lome-aneho-beach': 'tagBeach',
  'accra-cape-coast': 'tagGhana',
  'west-africa-grand-tour': 'tagGrand',
}

const previewTours = tours.slice(0, 3)

export default async function ToursPreview() {
  const locale = await getLocale()
  const t = await getTranslations('tours')
  return (
    <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-headline-lg">{t('sectionTitle')}</h2>
        <p className="text-on-surface-variant mt-2 text-body-md">
          {t('subtitle')}
        </p>
      </div>

      {/* Tours grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {previewTours.map((tour) => (
          <Link
            key={tour.id}
            href={`/${locale}/tours/${tour.id}`}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-lg block"
          >
            <img
              src={TOUR_IMAGES[tour.id] ?? TOUR_IMAGES['benin-history-lake']}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-sm mb-4 inline-block">
                {t(TOUR_TAG_KEYS[tour.id] ?? 'tagHistory')}
              </span>
              <h3 className="text-headline-md">{tour.title}</h3>
              <p className="text-body-sm text-surface-variant mt-2">
                {tour.destination} ({t('durationDays', { days: tour.durationDays })})
              </p>
              <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-headline-sm text-secondary-fixed">
                  {t('from')} {formatNGN(tour.startingFromNGN)}
                </span>
                <span className="material-symbols-outlined text-[32px]">arrow_circle_right</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Link
          href={`/${locale}/tours`}
          className="inline-flex items-center gap-2 rounded-xl border border-primary text-primary px-8 py-4 text-label-md hover:bg-primary hover:text-on-primary transition-all"
        >
          {t('viewAll')}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  )
}

import { prisma } from '@/lib/prisma'
import { tours as defaultTours } from '@/data/tours'
import type { Tour } from '@/types'

const TOUR_IMAGE_FALLBACKS: Record<string, string> = {
  'benin-history-lake': 'https://images.unsplash.com/photo-1612890009000-b9a73c018c85?auto=format&fit=crop&w=800&q=80',
  'lome-aneho-beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'accra-cape-coast': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
  'west-africa-grand-tour': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
}

export function fallbackTourImage(tourId: string) {
  return TOUR_IMAGE_FALLBACKS[tourId] ?? TOUR_IMAGE_FALLBACKS['west-africa-grand-tour']
}

export async function ensureDefaultTours() {
  const existing = await prisma.tour.findMany({ select: { id: true } })
  const existingIds = new Set(existing.map((t) => t.id))
  const missing = defaultTours.filter((t) => !existingIds.has(t.id))

  if (missing.length === 0) return

  await prisma.$transaction(
    missing.map((t) =>
      prisma.tour.create({
        data: {
          id: t.id,
          title: t.title,
          titleFr: t.titleFr ?? null,
          destination: t.destination ?? null,
          destinationFr: t.destinationFr ?? null,
          country: t.country,
          countryFr: t.countryFr ?? null,
          durationDays: t.durationDays,
          startingFromNGN: t.startingFromNGN,
          image: t.image ?? null,
          description: t.description,
          descriptionFr: t.descriptionFr ?? null,
          highlights: t.highlights ?? [],
          highlightsFr: t.highlightsFr ?? [],
        },
      })
    )
  )
}

export async function getPublicTours() {
  await ensureDefaultTours()
  const tours = await prisma.tour.findMany({
    orderBy: [{ startingFromNGN: 'asc' }, { title: 'asc' }],
  })

  return tours.map((t): Tour => ({
    id: t.id,
    title: t.title,
    titleFr: t.titleFr ?? t.title,
    destination: t.destination ?? t.country,
    destinationFr: t.destinationFr ?? t.destination ?? t.country,
    country: t.country,
    durationDays: t.durationDays,
    startingFromNGN: t.startingFromNGN,
    image: t.image || fallbackTourImage(t.id),
    description: t.description,
    descriptionFr: t.descriptionFr ?? t.description,
    highlights: t.highlights,
    highlightsFr: t.highlightsFr,
    included: [],
    includedFr: [],
  }))
}

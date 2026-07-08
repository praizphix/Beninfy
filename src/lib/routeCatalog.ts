import { routes as defaultRoutes } from '@/data/routes'

export async function ensureDefaultRoutes() {
  const { prisma } = await import('@/lib/prisma')
  const existing = await prisma.route.findMany({ select: { id: true } })
  const existingIds = new Set(existing.map((route) => route.id))
  const missing = defaultRoutes.filter((route) => !existingIds.has(route.id))

  if (missing.length === 0) return

  await prisma.$transaction(
    missing.map((route) =>
      prisma.route.create({
        data: {
          id: route.id,
          from: route.from,
          fromCode: route.fromCode,
          fromCountry: route.fromCountry,
          to: route.to,
          toCode: route.toCode,
          toCountry: route.toCountry,
          durationHours: route.durationHours,
          popular: route.popular,
          image: route.image,
          description: route.description,
          descriptionFr: route.descriptionFr,
          borderCrossings: route.borderCrossings,
        },
      })
    )
  )
}

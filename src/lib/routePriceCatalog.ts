import { routes as defaultRoutes } from '@/data/routes'
import { getRouteDropoffPrice, getRoutePrice, requiresLagosPickupArea, type RoutePriceScope } from '@/data/pricing'
import type { RouteId, VehicleId } from '@/types'
import { ensureDefaultRoutes } from '@/lib/routeCatalog'
import { ensureDefaultVehicles } from '@/lib/vehicleCatalog'

type RoutePriceSeed = {
  routeId: string
  vehicleId: string
  pricingScope: RoutePriceScope
  amountNGN: number
}

export async function ensureDefaultRoutePrices() {
  const { prisma } = await import('@/lib/prisma')

  await ensureDefaultRoutes()
  await ensureDefaultVehicles()
  await normalizeLegacyRoutePriceBuckets()

  const [vehicles, existing] = await Promise.all([
    prisma.vehicle.findMany({ select: { id: true, name: true } }),
    prisma.routePrice.findMany({ select: { routeId: true, vehicleId: true, pricingScope: true } }),
  ])

  const existingKeys = new Set(
    existing.map((price) => priceKey(price.routeId, price.vehicleId, normalizeScope(price.pricingScope)))
  )

  const missingPrices: RoutePriceSeed[] = defaultRoutes.flatMap((route) => {
    return vehicles.flatMap<RoutePriceSeed>((vehicle) => {
      const routeId = route.id as RouteId
      const vehicleId = vehicle.id as VehicleId

      if (requiresLagosPickupArea(routeId, vehicleId, vehicle.name)) {
        return (['mainland', 'island'] as const).flatMap((scope) => {
          const amountNGN = getRouteDropoffPrice(routeId, vehicleId, vehicle.name, scope)
          if (!amountNGN || existingKeys.has(priceKey(route.id, vehicle.id, scope))) return []
          return [{ routeId: route.id, vehicleId: vehicle.id, pricingScope: scope, amountNGN }]
        })
      }

      const amountNGN = fixedRouteAmount(routeId, vehicleId, vehicle.name)
      if (!amountNGN || existingKeys.has(priceKey(route.id, vehicle.id, 'default'))) return []
      return [{ routeId: route.id, vehicleId: vehicle.id, pricingScope: 'default' as const, amountNGN }]
    })
  })

  if (missingPrices.length === 0) return { created: 0 }

  const result = await prisma.routePrice.createMany({
    data: missingPrices.map((price) => ({
      ...price,
      notes: 'Default price seeded from Beninfy route table',
    })),
    skipDuplicates: true,
  })

  return { created: result.count }
}

export function normalizePricingVehicleId(vehicleId: string) {
  const text = vehicleId.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (text.includes('rav4') || text.includes('highlander') || text === 'suv') return 'suv'
  if (text.includes('gx460') || text.includes('lexusgx') || text.includes('lexus460')) return 'prado'
  if (text.includes('camry') || text.includes('sedan') || text.includes('saloon')) return 'saloon'

  return vehicleId
}

function fixedRouteAmount(routeId: RouteId, vehicleId: VehicleId, vehicleName: string) {
  const price = getRoutePrice(routeId, vehicleId, vehicleName)
  if (!price) return null
  if (typeof price === 'number') return price
  return price.min
}

function normalizeScope(scope: string | null | undefined): RoutePriceScope {
  return scope === 'mainland' || scope === 'island' ? scope : 'default'
}

function priceKey(routeId: string, vehicleId: string, scope: RoutePriceScope) {
  return `${routeId}:${vehicleId}:${scope}`
}

async function normalizeLegacyRoutePriceBuckets() {
  const { prisma } = await import('@/lib/prisma')
  const rows = await prisma.routePrice.findMany({
    select: {
      id: true,
      routeId: true,
      vehicleId: true,
      pricingScope: true,
      amountNGN: true,
      notes: true,
    },
  })

  for (const row of rows) {
    const normalizedVehicleId = normalizePricingVehicleId(row.vehicleId)
    if (normalizedVehicleId === row.vehicleId) continue

    const pricingScope = normalizeScope(row.pricingScope)
    const existingTarget = await prisma.routePrice.findFirst({
      where: {
        routeId: row.routeId,
        vehicleId: normalizedVehicleId,
        pricingScope,
      },
      select: { id: true },
    })

    if (existingTarget && existingTarget.id !== row.id) {
      await prisma.$transaction([
        prisma.routePrice.update({
          where: { id: existingTarget.id },
          data: {
            amountNGN: row.amountNGN,
            notes: row.notes,
          },
        }),
        prisma.routePrice.delete({ where: { id: row.id } }),
      ])
      continue
    }

    await prisma.routePrice.update({
      where: { id: row.id },
      data: {
        vehicleId: normalizedVehicleId,
        pricingScope,
      },
    })
  }
}

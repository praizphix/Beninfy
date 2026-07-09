import { prisma } from '@/lib/prisma'
import type { RoutePriceOverrideValue, RoutePriceOverrides, RoutePriceScope } from '@/data/pricing'

export async function getRoutePriceOverrides(routeId?: string): Promise<RoutePriceOverrides> {
  const rows = await prisma.routePrice.findMany({
    where: routeId ? { routeId } : undefined,
    select: { routeId: true, vehicleId: true, pricingScope: true, amountNGN: true },
  })

  return rows.reduce<RoutePriceOverrides>((acc, row) => {
    acc[row.routeId] ??= {}
    const scope = normalizeRoutePriceScope(row.pricingScope)
    const current = acc[row.routeId][row.vehicleId]

    if (scope === 'default' && !isScopedOverride(current)) {
      acc[row.routeId][row.vehicleId] = row.amountNGN
    } else {
      const scoped = isScopedOverride(current) ? current : typeof current === 'number' ? { default: current } : {}
      scoped[scope] = row.amountNGN
      acc[row.routeId][row.vehicleId] = scoped
    }

    return acc
  }, {})
}

function normalizeRoutePriceScope(scope: string | null | undefined): RoutePriceScope {
  return scope === 'mainland' || scope === 'island' ? scope : 'default'
}

function isScopedOverride(value: RoutePriceOverrideValue | undefined): value is Partial<Record<RoutePriceScope, number>> {
  return typeof value === 'object' && value !== null
}

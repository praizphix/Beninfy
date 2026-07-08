import { prisma } from '@/lib/prisma'
import type { RoutePriceOverrides } from '@/data/pricing'

export async function getRoutePriceOverrides(routeId?: string): Promise<RoutePriceOverrides> {
  const rows = await prisma.routePrice.findMany({
    where: routeId ? { routeId } : undefined,
    select: { routeId: true, vehicleId: true, amountNGN: true },
  })

  return rows.reduce<RoutePriceOverrides>((acc, row) => {
    acc[row.routeId] ??= {}
    acc[row.routeId][row.vehicleId] = row.amountNGN
    return acc
  }, {})
}

import { prisma } from '@/lib/prisma'
import { vehicles as defaultVehicles } from '@/data/vehicles'
import type { Vehicle } from '@/types'

const VEHICLE_IMAGE_FALLBACKS: Record<string, string> = {
  saloon: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
  sienna: 'https://images.unsplash.com/photo-1474978528675-2bfa6e89b7b0?auto=format&fit=crop&w=800&q=80',
  prado: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  sprinter: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  hiace: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  coastal: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
}

export function fallbackVehicleImage(vehicleId: string) {
  return VEHICLE_IMAGE_FALLBACKS[vehicleId] ?? VEHICLE_IMAGE_FALLBACKS.saloon
}

export async function ensureDefaultVehicles() {
  const existing = await prisma.vehicle.findMany({ select: { id: true } })
  const existingIds = new Set(existing.map((v) => v.id))
  const missing = defaultVehicles.filter((v) => !existingIds.has(v.id))

  if (missing.length === 0) return

  await prisma.$transaction(
    missing.map((v) =>
      prisma.vehicle.create({
        data: {
          id: v.id,
          name: v.name,
          nameFr: v.nameFr ?? null,
          capacity: v.capacity,
          luggageCapacity: v.luggageCapacity ?? 0,
          available: v.available ?? true,
          image: v.image ?? null,
          description: v.description ?? null,
          descriptionFr: v.descriptionFr ?? null,
          badge: v.badge ?? null,
          badgeFr: v.badgeFr ?? null,
          features: v.features ?? [],
          featuresFr: v.featuresFr ?? [],
        },
      })
    )
  )
}

export async function getPublicVehicles({ availableOnly = true } = {}) {
  await ensureDefaultVehicles()
  const vehicles = await prisma.vehicle.findMany({
    where: availableOnly ? { available: true } : undefined,
    orderBy: [{ capacity: 'asc' }, { name: 'asc' }],
  })

  return vehicles.map((v): Vehicle => ({
    id: v.id,
    name: v.name,
    nameFr: v.nameFr ?? v.name,
    capacity: v.capacity,
    luggageCapacity: v.luggageCapacity,
    features: v.features,
    featuresFr: v.featuresFr,
    image: v.image || fallbackVehicleImage(v.id),
    description: v.description ?? '',
    descriptionFr: v.descriptionFr ?? v.description ?? '',
    available: v.available,
    basePriceNGN: v.basePriceNGN,
    badge: v.badge ?? undefined,
    badgeFr: v.badgeFr ?? undefined,
  }))
}

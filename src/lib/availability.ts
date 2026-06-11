import { prisma } from '@/lib/prisma'

function dayWindow(date: Date) {
  const startsAt = new Date(date)
  startsAt.setHours(0, 0, 0, 0)
  const endsAt = new Date(date)
  endsAt.setHours(23, 59, 59, 999)
  return { startsAt, endsAt }
}

export async function getAvailableFleetVehicleCount(vehicleId: string, departureDate: Date) {
  const { startsAt, endsAt } = dayWindow(departureDate)
  const physicalFleetCount = await prisma.fleetVehicle.count({ where: { vehicleId } })

  if (physicalFleetCount === 0) {
    return { physicalFleetCount, availableCount: null as number | null }
  }

  const availableCount = await prisma.fleetVehicle.count({
    where: {
      vehicleId,
      status: 'available',
      blocks: {
        none: {
          startsAt: { lte: endsAt },
          endsAt: { gte: startsAt },
        },
      },
      bookingLegs: {
        none: {
          departureDate: { gte: startsAt, lte: endsAt },
          status: { notIn: ['cancelled', 'completed'] },
        },
      },
    },
  })

  return { physicalFleetCount, availableCount }
}

export async function assertVehicleTypeAvailable(vehicleId: string, dates: Date[]) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
  if (!vehicle) return { ok: false as const, status: 404, error: 'Vehicle not found' }
  if (!vehicle.available) return { ok: false as const, status: 409, error: 'Vehicle type is unavailable for booking' }

  for (const date of dates) {
    const availability = await getAvailableFleetVehicleCount(vehicleId, date)
    if (availability.availableCount !== null && availability.availableCount < 1) {
      return {
        ok: false as const,
        status: 409,
        error: `No ${vehicle.name} fleet unit is available on ${date.toISOString().slice(0, 10)}`,
      }
    }
  }

  return { ok: true as const, vehicle }
}

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findRoute } from '@/data/routes'
import { getRouteDropoffPrice, requiresLagosPickupArea } from '@/data/pricing'
import { getRouteBorderFee } from '@/data/borderFees'
import { vehicles as catalogVehicles } from '@/data/vehicles'
import { assertVehicleTypeAvailable, findAvailableFleetVehicle } from '@/lib/availability'
import { getRoutePriceOverrides } from '@/lib/routePriceOverrides'
import type { RouteId, VehicleId } from '@/types'

const createSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
  returnDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid return date').optional(),
  tripType: z.enum(['one-way', 'round-trip']).default('one-way'),
  vehicleId: z.string().min(1),
  passengers: z.number().int().positive().max(50),
  priceNGN: z.number().int().nonnegative(),
  passengerName: z.string().trim().max(100).optional(),
  passengerEmail: z.string().trim().email().optional().or(z.literal('')),
  passengerPhone: z.string().trim().max(40).optional(),
  passportId: z.string().trim().max(80).optional(),
  nationality: z.string().trim().max(80).optional(),
  pickupAddress: z.string().trim().max(240).optional(),
  dropoffAddress: z.string().trim().max(240).optional(),
  specialRequirements: z.string().trim().max(1000).optional(),
  pickupArea: z.enum(['mainland', 'island']).optional(),
})

class BookingAvailabilityError extends Error {
  status: number

  constructor(message: string, status = 409) {
    super(message)
    this.status = status
  }
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const userName = session.user.name ?? null
  const userEmail = session.user.email ?? null
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const departureDate = new Date(data.date)
  const returnDate = data.returnDate ? new Date(data.returnDate) : null

  if (data.tripType === 'round-trip') {
    if (!returnDate) {
      return NextResponse.json({ error: 'Return date is required for round trips' }, { status: 400 })
    }
    if (returnDate < departureDate) {
      return NextResponse.json({ error: 'Return date must be on or after departure date' }, { status: 400 })
    }
  }

  let vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
  if (!vehicle) {
    const fromCatalog = catalogVehicles.find((v) => v.id === data.vehicleId)
    if (!fromCatalog) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    vehicle = await prisma.vehicle.create({
      data: {
        id: fromCatalog.id,
        name: fromCatalog.name,
        capacity: fromCatalog.capacity,
        available: fromCatalog.available,
      },
    })
  }

  const matchedRoute = findRoute(data.from, data.to)
  if (
    matchedRoute &&
    requiresLagosPickupArea(matchedRoute.id as RouteId, vehicle.id as VehicleId, vehicle.name) &&
    !data.pickupArea
  ) {
    return NextResponse.json({ error: 'Pickup area is required for Lagos saloon pricing' }, { status: 400 })
  }
  if (!matchedRoute) {
    return NextResponse.json({ error: 'This route is not available for booking' }, { status: 400 })
  }
  const routePriceOverrides = await getRoutePriceOverrides(matchedRoute.id)
  const dropoffFare = getRouteDropoffPrice(
    matchedRoute.id as RouteId,
    vehicle.id as VehicleId,
    vehicle.name,
    data.pickupArea,
    routePriceOverrides
  )
  if (dropoffFare === null) {
    return NextResponse.json({ error: 'This vehicle is not priced for the selected route' }, { status: 400 })
  }
  const legCount = data.tripType === 'round-trip' ? 2 : 1
  const rideFare = dropoffFare * legCount
  const borderFee = getRouteBorderFee(matchedRoute.id as RouteId, data.tripType)
  const serviceFee = Math.round(rideFare * 0.05)
  const priceNGN = rideFare + borderFee + serviceFee

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const datesToCheck = data.tripType === 'round-trip' && returnDate ? [departureDate, returnDate] : [departureDate]
      const availability = await assertVehicleTypeAvailable(vehicle.id, datesToCheck, tx)
      if (!availability.ok) {
        throw new BookingAvailabilityError(availability.error, availability.status)
      }

      const reservedFleetVehicles = new Map<string, { id: string; label: string }>()
      for (const date of datesToCheck) {
        const key = dateKey(date)
        if (reservedFleetVehicles.has(key)) continue

        const fleetVehicle = await findAvailableFleetVehicle(vehicle.id, date, tx)
        if (!fleetVehicle) {
          throw new BookingAvailabilityError(
            `All ${vehicle.name} units are booked on ${key}. Please choose another vehicle or date.`
          )
        }
        reservedFleetVehicles.set(key, fleetVehicle)
      }

      return tx.booking.create({
        data: {
          userId,
          from: data.from,
          to: data.to,
          date: departureDate,
          returnDate,
          tripType: data.tripType === 'round-trip' ? 'round_trip' : 'one_way',
          passengerName: data.passengerName || userName,
          passengerEmail: data.passengerEmail || userEmail,
          passengerPhone: data.passengerPhone || null,
          passportId: data.passportId || null,
          nationality: data.nationality || null,
          pickupAddress: data.pickupAddress || null,
          dropoffAddress: data.dropoffAddress || null,
          specialRequirements: data.specialRequirements || null,
          vehicleId: vehicle.id,
          passengers: data.passengers,
          priceNGN,
          legs: {
            create: [
              {
                direction: 'outbound',
                from: data.from,
                to: data.to,
                departureDate,
                vehicleId: vehicle.id,
                fleetVehicleId: reservedFleetVehicles.get(dateKey(departureDate))?.id,
                status: 'reserved',
              },
              ...(data.tripType === 'round-trip' && returnDate
                ? [{
                    direction: 'return',
                    from: data.to,
                    to: data.from,
                    departureDate: returnDate,
                    vehicleId: vehicle.id,
                    fleetVehicleId: reservedFleetVehicles.get(dateKey(returnDate))?.id,
                    status: 'reserved',
                  }]
                : []),
            ],
          },
        },
        include: { legs: true },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof BookingAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Fleet availability changed while booking. Please try again.' },
        { status: 409 }
      )
    }
    throw error
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { legs: true },
  })
  return NextResponse.json({ bookings })
}

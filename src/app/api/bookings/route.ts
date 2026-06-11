import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { vehicles as catalogVehicles } from '@/data/vehicles'
import { assertVehicleTypeAvailable } from '@/lib/availability'

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
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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

  const datesToCheck = data.tripType === 'round-trip' && returnDate ? [departureDate, returnDate] : [departureDate]
  const availability = await assertVehicleTypeAvailable(vehicle.id, datesToCheck)
  if (!availability.ok) {
    return NextResponse.json({ error: availability.error }, { status: availability.status })
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      from: data.from,
      to: data.to,
      date: departureDate,
      returnDate,
      tripType: data.tripType === 'round-trip' ? 'round_trip' : 'one_way',
      passengerName: data.passengerName || session.user.name || null,
      passengerEmail: data.passengerEmail || session.user.email || null,
      passengerPhone: data.passengerPhone || null,
      passportId: data.passportId || null,
      nationality: data.nationality || null,
      pickupAddress: data.pickupAddress || null,
      dropoffAddress: data.dropoffAddress || null,
      specialRequirements: data.specialRequirements || null,
      vehicleId: vehicle.id,
      passengers: data.passengers,
      priceNGN: data.priceNGN,
      legs: {
        create: [
          {
            direction: 'outbound',
            from: data.from,
            to: data.to,
            departureDate,
            vehicleId: vehicle.id,
          },
          ...(data.tripType === 'round-trip' && returnDate
            ? [{
                direction: 'return',
                from: data.to,
                to: data.from,
                departureDate: returnDate,
                vehicleId: vehicle.id,
              }]
            : []),
        ],
      },
    },
    include: { legs: true },
  })
  return NextResponse.json({ booking }, { status: 201 })
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

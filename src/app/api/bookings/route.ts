import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { vehicles as catalogVehicles } from '@/data/vehicles'

const createSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
  vehicleId: z.string().min(1),
  passengers: z.number().int().positive().max(50),
  priceNGN: z.number().int().nonnegative(),
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

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      from: data.from,
      to: data.to,
      date: new Date(data.date),
      vehicleId: vehicle.id,
      passengers: data.passengers,
      priceNGN: data.priceNGN,
    },
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
  })
  return NextResponse.json({ bookings })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? undefined
  const q = url.searchParams.get('q')?.trim()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { from: { contains: q, mode: 'insensitive' } },
      { to: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const bookings = await prisma.booking.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      vehicle: { select: { id: true, name: true } },
      payments: { select: { id: true, status: true, amountNGN: true, reference: true, createdAt: true } },
      legs: {
        orderBy: { departureDate: 'asc' },
        include: {
          fleetVehicle: { select: { id: true, label: true, plateNumber: true, color: true } },
          driver: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  })

  return NextResponse.json({ bookings })
}

const patchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
})

export async function PATCH() {
  return NextResponse.json({ error: 'Use /api/admin/bookings/[id]' }, { status: 405 })
}

export { patchSchema }

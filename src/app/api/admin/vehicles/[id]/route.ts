import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  nameFr: z.string().nullable().optional(),
  capacity: z.number().int().positive().optional(),
  luggageCapacity: z.number().int().nonnegative().optional(),
  available: z.boolean().optional(),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  descriptionFr: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  badgeFr: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  featuresFr: z.array(z.string()).optional(),
  basePriceNGN: z.number().int().positive().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const vehicle = await prisma.vehicle.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ vehicle })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const bookingCount = await prisma.booking.count({ where: { vehicleId: id } })
  if (bookingCount > 0) {
    return NextResponse.json({ error: 'Cannot delete: vehicle has bookings. Mark unavailable instead.' }, { status: 409 })
  }
  await prisma.vehicle.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

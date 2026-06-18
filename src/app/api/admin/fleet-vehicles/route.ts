import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().nullable().optional()
)

const schema = z.object({
  vehicleId: z.string().trim().min(1),
  label: z.string().trim().min(1).max(120),
  plateNumber: z.string().trim().min(1).max(40),
  status: z.enum(['available', 'maintenance', 'inactive']).default('available'),
  currentCity: optionalText,
  notes: optionalText,
})

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const fleetVehicles = await prisma.fleetVehicle.findMany({
    orderBy: [{ status: 'asc' }, { label: 'asc' }],
    include: { vehicle: { select: { id: true, name: true } } },
  })
  return NextResponse.json({ fleetVehicles })
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  try {
    const fleetVehicle = await prisma.fleetVehicle.create({ data: parsed.data })
    return NextResponse.json({ fleetVehicle }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A fleet unit with this plate number already exists' }, { status: 409 })
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Selected vehicle type does not exist' }, { status: 400 })
      }
    }
    throw error
  }
}

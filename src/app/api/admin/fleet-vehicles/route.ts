import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  vehicleId: z.string().min(1),
  label: z.string().min(1).max(120),
  plateNumber: z.string().min(1).max(40),
  status: z.enum(['available', 'maintenance', 'inactive']).default('available'),
  currentCity: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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
  const fleetVehicle = await prisma.fleetVehicle.create({ data: parsed.data })
  return NextResponse.json({ fleetVehicle }, { status: 201 })
}

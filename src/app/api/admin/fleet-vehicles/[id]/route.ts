import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  label: z.string().min(1).max(120).optional(),
  plateNumber: z.string().min(1).max(40).optional(),
  status: z.enum(['available', 'maintenance', 'inactive']).optional(),
  currentCity: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const fleetVehicle = await prisma.fleetVehicle.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ fleetVehicle })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const assignedLegs = await prisma.bookingLeg.count({ where: { fleetVehicleId: id } })
  if (assignedLegs > 0) {
    return NextResponse.json({ error: 'Cannot delete: this fleet vehicle has assigned booking legs.' }, { status: 409 })
  }
  await prisma.fleetVehicle.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

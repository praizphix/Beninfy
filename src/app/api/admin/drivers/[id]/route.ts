import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(1).max(40).optional(),
  email: z.string().email().nullable().optional(),
  status: z.enum(['available', 'off_duty', 'inactive']).optional(),
  homeCity: z.string().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const driver = await prisma.driver.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ driver })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const assignedLegs = await prisma.bookingLeg.count({ where: { driverId: id } })
  if (assignedLegs > 0) {
    return NextResponse.json({ error: 'Cannot delete: this driver has assigned booking legs.' }, { status: 409 })
  }
  await prisma.driver.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

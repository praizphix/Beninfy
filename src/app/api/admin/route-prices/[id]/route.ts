import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  routeId: z.string().trim().min(1).optional(),
  vehicleId: z.string().trim().min(1).optional(),
  pricingScope: z.enum(['default', 'mainland', 'island']).optional(),
  amountNGN: z.number().int().positive().optional(),
  notes: z.string().trim().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })

  try {
    const routePrice = await prisma.routePrice.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ routePrice })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'This route, vehicle, and pricing scope already have a price.' }, { status: 409 })
    }
    throw error
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  await prisma.routePrice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

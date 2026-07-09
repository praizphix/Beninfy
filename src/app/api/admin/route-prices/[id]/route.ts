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
    const current = await prisma.routePrice.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'Route price not found. Please refresh and try again.' }, { status: 404 })

    const routeId = parsed.data.routeId ?? current.routeId
    const vehicleId = parsed.data.vehicleId ?? current.vehicleId
    const pricingScope = parsed.data.pricingScope ?? current.pricingScope
    const amountNGN = parsed.data.amountNGN ?? current.amountNGN
    const notes = Object.hasOwn(parsed.data, 'notes') ? parsed.data.notes : current.notes

    const existingTarget = await prisma.routePrice.findFirst({
      where: { routeId, vehicleId, pricingScope },
      select: { id: true },
    })

    if (existingTarget && existingTarget.id !== id) {
      const routePrice = await prisma.$transaction(async (tx) => {
        const updated = await tx.routePrice.update({
          where: { id: existingTarget.id },
          data: { amountNGN, notes },
        })
        await tx.routePrice.delete({ where: { id } })
        return updated
      })
      return NextResponse.json({ routePrice })
    }

    const routePrice = await prisma.routePrice.update({
      where: { id },
      data: { routeId, vehicleId, pricingScope, amountNGN, notes },
    })
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

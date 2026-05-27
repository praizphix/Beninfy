import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  titleFr: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  destinationFr: z.string().nullable().optional(),
  country: z.string().min(1).optional(),
  countryFr: z.string().nullable().optional(),
  durationDays: z.number().int().positive().optional(),
  startingFromNGN: z.number().int().positive().optional(),
  image: z.string().nullable().optional(),
  description: z.string().min(1).optional(),
  descriptionFr: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  highlightsFr: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const tour = await prisma.tour.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ tour })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  await prisma.tour.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

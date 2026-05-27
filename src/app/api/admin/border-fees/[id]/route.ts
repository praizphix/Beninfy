import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  country: z.string().min(1).optional(),
  countryFr: z.string().nullable().optional(),
  border: z.string().min(1).optional(),
  borderFr: z.string().nullable().optional(),
  countries: z.array(z.string()).optional(),
  feePerPersonNGN: z.number().int().nonnegative().optional(),
  feeRoundTripNGN: z.number().int().nonnegative().optional(),
  popular: z.boolean().optional(),
  icon: z.string().nullable().optional(),
  services: z.array(z.string()).optional(),
  servicesFr: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  documentsFr: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  tipsFr: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const borderFee = await prisma.borderFee.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ borderFee })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const { id } = await params
  await prisma.borderFee.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

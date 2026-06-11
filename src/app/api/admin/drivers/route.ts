import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  email: z.string().email().nullable().optional(),
  status: z.enum(['available', 'off_duty', 'inactive']).default('available'),
  homeCity: z.string().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const drivers = await prisma.driver.findMany({ orderBy: [{ status: 'asc' }, { name: 'asc' }] })
  return NextResponse.json({ drivers })
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const driver = await prisma.driver.create({ data: parsed.data })
  return NextResponse.json({ driver }, { status: 201 })
}

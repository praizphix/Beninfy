import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCustomer } from '@/lib/customer'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(4).max(30).nullable().optional(),
  image: z.string().url().nullable().optional(),
})

export async function GET() {
  const customer = await requireCustomer()
  if (!customer.ok) return customer.response
  const { session } = customer
  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const customer = await requireCustomer()
  if (!customer.ok) return customer.response
  const { session } = customer
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }
  const user = await prisma.user.update({
    where: { id: session.user!.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, image: true },
  })
  return NextResponse.json({ user })
}

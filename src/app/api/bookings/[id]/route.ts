import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ booking })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (booking.status === 'completed') {
    return NextResponse.json({ error: 'Cannot cancel a completed booking' }, { status: 409 })
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
  })
  return NextResponse.json({ booking: updated })
}

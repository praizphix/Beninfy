import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payments = await prisma.payment.findMany({
    where: { booking: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      amountNGN: true,
      status: true,
      createdAt: true,
      booking: { select: { id: true, from: true, to: true, date: true } },
    },
  })
  return NextResponse.json({ payments })
}

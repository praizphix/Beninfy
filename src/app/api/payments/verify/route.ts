import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaystackSecret, settlePaymentFromPaystack, verifyPaystackTransaction } from '@/lib/paystack'

const verifySchema = z.object({
  reference: z.string().min(1),
})

async function verify(reference: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { booking: { select: { userId: true } } },
  })
  if (!payment || payment.booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const secret = getPaystackSecret()
  if (!secret) {
    return NextResponse.json({ error: 'Paystack is not configured' }, { status: 503 })
  }

  try {
    const verified = await verifyPaystackTransaction(secret, reference)
    const settlement = await settlePaymentFromPaystack(reference, verified)
    return NextResponse.json({ payment: settlement, transaction: verified.data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment verification failed' },
      { status: 502 }
    )
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = verifySchema.safeParse({ reference: url.searchParams.get('reference') })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }
  return verify(parsed.data.reference)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }
  return verify(parsed.data.reference)
}

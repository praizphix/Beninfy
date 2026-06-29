import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getPaymentConfigurationError,
  getPayazaApiKey,
  settlePaymentFromPayaza,
  verifyPayazaTransaction,
  type PayazaCurrency,
} from '@/lib/payaza'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

const verifySchema = z.object({
  reference: z.string().trim().min(1).max(100),
  currencyCode: z.enum(['NGN', 'XOF']).optional(),
})

async function verify(req: Request, reference: string, currencyCode?: PayazaCurrency) {
  const configurationError = getPaymentConfigurationError()
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rateLimit = await checkRateLimit({
    scope: 'payment-verify',
    identifier: `${session.user.id}:${requestIp(req)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { booking: { select: { userId: true } } },
  })
  if (!payment || payment.booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const apiKey = getPayazaApiKey()
  if (!apiKey) {
    return NextResponse.json({ error: 'Payaza is not configured' }, { status: 503 })
  }

  try {
    const verified = await verifyPayazaTransaction(reference)
    const settlement = await settlePaymentFromPayaza(reference, verified, currencyCode)
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
  const parsed = verifySchema.safeParse({
    reference: url.searchParams.get('reference'),
    currencyCode: url.searchParams.get('currencyCode') || undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }
  return verify(req, parsed.data.reference, parsed.data.currencyCode as PayazaCurrency | undefined)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }
  return verify(req, parsed.data.reference, parsed.data.currencyCode as PayazaCurrency | undefined)
}

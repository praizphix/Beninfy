import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { requireCustomer } from '@/lib/customer'
import { prisma } from '@/lib/prisma'
import {
  getPaymentConfigurationError,
  getPayOnUsBusinessId,
  getPayOnUsEnvironment,
  normalizePayOnUsPhone,
} from '@/lib/payonus'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

const initSchema = z.object({
  bookingId: z.string().min(1),
  locale: z.enum(['en', 'fr']).default('en'),
  passengerName: z.string().trim().max(100).optional(),
  passengerPhone: z.string().trim().max(40).optional(),
  currencyCode: z.literal('NGN').default('NGN'),
})

export async function POST(req: Request) {
  const configurationError = getPaymentConfigurationError()
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 })
  }

  const customer = await requireCustomer()
  if (!customer.ok) return customer.response
  const { session } = customer
  const user = session.user!
  const rateLimit = await checkRateLimit({
    scope: 'payment-initiate',
    identifier: `${user.id}:${requestIp(req)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many payment attempts' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }
  const body = await req.json().catch(() => null)
  const parsed = initSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } })
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const reference = `BFY-${booking.id.slice(-6).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
  const email = user.email ?? `user-${user.id}@beninfy.com`
  const businessId = getPayOnUsBusinessId()
  if (!businessId) return NextResponse.json({ error: 'PayOnUs business ID is not configured' }, { status: 503 })
  const origin = new URL(req.url).origin
  const customerName = parsed.data.passengerName || user.name || 'Beninfy Customer'

  await prisma.payment.upsert({
    where: { reference },
    update: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
      provider: 'payonus',
      currencyCode: 'NGN',
      checkoutAmount: booking.priceNGN,
    },
    create: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
      reference,
      provider: 'payonus',
      currencyCode: 'NGN',
      checkoutAmount: booking.priceNGN,
    },
  })

  return NextResponse.json({
    mode: 'payonus_checkout',
    provider: 'payonus',
    reference,
    bookingId: booking.id,
    checkout: {
      businessId,
      amount: booking.priceNGN,
      currency: 'NGN',
      customerEmail: email,
      customerName,
      customerPhone: normalizePayOnUsPhone(parsed.data.passengerPhone || booking.passengerPhone || ''),
      merchantCheckoutReference: reference,
      countryCode: 'NG',
      notificationUrl: `${origin}/api/payments/webhook`,
      redirectUrl: `${origin}/${parsed.data.locale}/rides/confirmed`,
      environment: getPayOnUsEnvironment(),
      paymentMethods: ['card', 'bank', 'palmpay', 'opay'],
    },
  })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  convertBookingAmount,
  getPaymentConfigurationError,
  getPayazaConnectionMode,
  getPayazaPublicKey,
  normalizePayazaPhone,
  splitCustomerName,
  type PayazaCurrency,
} from '@/lib/payaza'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

const initSchema = z.object({
  bookingId: z.string().min(1),
  locale: z.enum(['en', 'fr']).default('en'),
  passengerName: z.string().trim().max(100).optional(),
  passengerPhone: z.string().trim().max(40).optional(),
  currencyCode: z.enum(['NGN', 'XOF']).default('NGN'),
})

export async function POST(req: Request) {
  const configurationError = getPaymentConfigurationError()
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rateLimit = await checkRateLimit({
    scope: 'payment-initiate',
    identifier: `${session.user.id}:${requestIp(req)}`,
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
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const reference = `BFY-${booking.id.slice(-6).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
  const publicKey = getPayazaPublicKey()
  const email = session.user.email ?? `user-${session.user.id}@beninfy.com`
  const currencyCode = parsed.data.currencyCode as PayazaCurrency

  if (!publicKey) return NextResponse.json({ error: 'Payments are not fully configured' }, { status: 503 })

  let checkoutAmount: number
  try {
    checkoutAmount = convertBookingAmount(booking.priceNGN, currencyCode)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment currency is not configured' },
      { status: 503 }
    )
  }

  const { firstName, lastName } = splitCustomerName(parsed.data.passengerName || session.user.name || 'Beninfy Customer')

  await prisma.payment.upsert({
    where: { reference },
    update: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
    },
    create: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
      reference,
    },
  })

  return NextResponse.json({
    mode: 'payaza_checkout',
    provider: 'payaza',
    reference,
    bookingId: booking.id,
    checkout: {
      merchant_key: publicKey,
      connection_mode: getPayazaConnectionMode(),
      checkout_amount: checkoutAmount,
      currency_code: currencyCode,
      email_address: email,
      first_name: firstName,
      last_name: lastName,
      phone_number: normalizePayazaPhone(parsed.data.passengerPhone || booking.passengerPhone || '', currencyCode),
      transaction_reference: reference,
      ...(currencyCode === 'XOF' ? { country_code: 'BEN' } : {}),
      biller_name: 'Beninfy',
      virtual_account_configuration: { expires_in_minutes: 30 },
      additional_details: {
        bookingId: booking.id,
        userId: session.user.id,
        currencyCode,
        amountNGN: String(booking.priceNGN),
      },
    },
  })
}

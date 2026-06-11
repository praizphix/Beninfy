import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaystackSecret, initializePaystackTransaction } from '@/lib/paystack'

const initSchema = z.object({
  bookingId: z.string().min(1),
  locale: z.enum(['en', 'fr']).default('en'),
  passengerName: z.string().trim().max(100).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
  const secret = getPaystackSecret()
  const email = session.user.email ?? `user-${session.user.id}@beninfy.com`

  if (!secret) {
    // Dev/stub mode: mark as paid immediately and let the UI move forward.
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amountNGN: booking.priceNGN,
        status: 'paid',
        reference,
      },
    })
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed', paymentId: payment.id },
    })
    return NextResponse.json({
      mode: 'stub',
      reference,
      bookingId: booking.id,
      status: 'paid',
    })
  }

  const origin = new URL(req.url).origin
  const callbackUrl = new URL(`/${parsed.data.locale}/rides/confirmed`, origin)
  callbackUrl.searchParams.set('id', booking.id)
  if (parsed.data.passengerName) callbackUrl.searchParams.set('name', parsed.data.passengerName)

  let initialized: Awaited<ReturnType<typeof initializePaystackTransaction>>
  try {
    initialized = await initializePaystackTransaction({
      secret,
      email,
      amountNGN: booking.priceNGN,
      reference,
      callbackUrl: callbackUrl.toString(),
      metadata: {
        bookingId: booking.id,
        userId: session.user.id,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment init failed' },
      { status: 502 }
    )
  }

  await prisma.payment.upsert({
    where: { reference: initialized.reference },
    update: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
    },
    create: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
      reference: initialized.reference,
    },
  })

  return NextResponse.json({
    mode: 'paystack',
    authorization_url: initialized.authorizationUrl,
    access_code: initialized.accessCode,
    reference: initialized.reference,
    bookingId: booking.id,
  })
}

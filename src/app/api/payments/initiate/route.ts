import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const initSchema = z.object({
  bookingId: z.string().min(1),
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
  const secret = process.env.PAYSTACK_SECRET_KEY
  const email = session.user.email ?? `user-${session.user.id}@beninfy.africa`

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

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: booking.priceNGN * 100,
      reference,
      currency: 'NGN',
      metadata: { bookingId: booking.id, userId: session.user.id },
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.data?.authorization_url) {
    return NextResponse.json({ error: 'Payment init failed', detail: json }, { status: 502 })
  }

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amountNGN: booking.priceNGN,
      status: 'pending',
      reference,
    },
  })

  return NextResponse.json({
    mode: 'paystack',
    authorization_url: json.data.authorization_url as string,
    reference,
    bookingId: booking.id,
  })
}

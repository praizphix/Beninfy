import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getPaystackSecret, settlePaymentFromPaystack, type PaystackVerifyResponse } from '@/lib/paystack'

export async function POST(req: Request) {
  const secret = getPaystackSecret()
  if (!secret) {
    return NextResponse.json({ error: 'Webhook disabled' }, { status: 503 })
  }

  const raw = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const expected = createHmac('sha512', secret).update(raw).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: PaystackVerifyResponse['data'] }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const reference = event.data?.reference
  if (!reference) return NextResponse.json({ ok: true })

  const payment = await prisma.payment.findUnique({ where: { reference } })
  if (!payment) return NextResponse.json({ ok: true })

  if (event.event === 'charge.success') {
    await settlePaymentFromPaystack(reference, {
      status: true,
      data: event.data,
    })
  } else if (event.event === 'charge.failed') {
    await prisma.payment.update({ where: { reference }, data: { status: 'failed' } })
  }

  return NextResponse.json({ ok: true })
}

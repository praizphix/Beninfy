import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getPayazaWebhookSecret, settlePaymentFromPayazaWebhook } from '@/lib/payaza'

export async function POST(req: Request) {
  const raw = await req.text()
  const secret = getPayazaWebhookSecret()
  if (secret) {
    const signature = req.headers.get('x-payaza-signature') ?? ''
    const expected = createHmac('sha512', secret).update(raw, 'utf8').digest('base64')

    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signature, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: {
    merchant_reference?: string
    transaction_reference?: string
    status?: string
    transaction_status?: string
    amount_received?: number | string
    request_amount?: number | string
    currency_code?: string
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const reference = event.merchant_reference || event.transaction_reference
  if (!reference) return NextResponse.json({ ok: true })

  const payment = await prisma.payment.findUnique({ where: { reference } })
  if (!payment) return NextResponse.json({ ok: true })

  const settlement = await settlePaymentFromPayazaWebhook(event)
  if (settlement && !settlement.ok && settlement.status === 'failed') {
    await prisma.payment.update({ where: { reference }, data: { status: 'failed' } })
  }

  return NextResponse.json({ ok: true })
}

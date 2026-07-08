import { NextResponse } from 'next/server'
import {
  paymentsEnabled,
  settlePaymentFromPayOnUsWebhook,
  verifyPayOnUsWebhookHash,
  type PayOnUsWebhookPayload,
} from '@/lib/payonus'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  if (!paymentsEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const rateLimit = await checkRateLimit({
    scope: 'payment-webhook',
    identifier: requestIp(req),
    limit: 60,
    windowMs: 60 * 1000,
  })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > 64 * 1024) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  const raw = await req.text()
  if (raw.length > 64 * 1024) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let event: PayOnUsWebhookPayload
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const hash = req.headers.get('hash') ?? ''
  if (!verifyPayOnUsWebhookHash(event, hash)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  await settlePaymentFromPayOnUsWebhook(event)

  return NextResponse.json({ ok: true })
}

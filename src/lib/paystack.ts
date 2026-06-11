import { prisma } from '@/lib/prisma'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

type PaystackInitializeResponse = {
  status?: boolean
  message?: string
  data?: {
    authorization_url?: string
    access_code?: string
    reference?: string
  }
}

export type PaystackVerifyResponse = {
  status?: boolean
  message?: string
  data?: {
    status?: string
    reference?: string
    amount?: number
    currency?: string
    paid_at?: string
    channel?: string
    gateway_response?: string
  }
}

export type PaymentSettlement =
  | { ok: true; status: 'paid'; bookingId: string; reference: string }
  | { ok: false; status: 'pending' | 'failed' | 'amount_mismatch' | 'not_found'; message: string }

export function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY?.trim()
}

export async function initializePaystackTransaction({
  secret,
  email,
  amountNGN,
  reference,
  callbackUrl,
  metadata,
}: {
  secret: string
  email: string
  amountNGN: number
  reference: string
  callbackUrl: string
  metadata: Record<string, string>
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountNGN * 100,
      reference,
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata,
    }),
  })

  const json = (await res.json().catch(() => ({}))) as PaystackInitializeResponse
  if (!res.ok || !json.status || !json.data?.authorization_url || !json.data?.reference) {
    throw new Error(json.message || 'Payment init failed')
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  }
}

export async function verifyPaystackTransaction(secret: string, reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  })

  const json = (await res.json().catch(() => ({}))) as PaystackVerifyResponse
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Payment verification failed')
  }
  return json
}

export async function settlePaymentFromPaystack(reference: string, verified: PaystackVerifyResponse): Promise<PaymentSettlement> {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { booking: true },
  })

  if (!payment) {
    return { ok: false, status: 'not_found', message: 'Payment record not found' }
  }

  const transaction = verified.data
  if (transaction?.status !== 'success') {
    await prisma.payment.update({ where: { reference }, data: { status: transaction?.status || 'failed' } })
    return { ok: false, status: 'failed', message: transaction?.gateway_response || 'Payment was not successful' }
  }

  const expectedAmount = payment.amountNGN * 100
  if (transaction.amount !== expectedAmount || transaction.currency !== 'NGN') {
    await prisma.payment.update({ where: { reference }, data: { status: 'amount_mismatch' } })
    return { ok: false, status: 'amount_mismatch', message: 'Payment amount does not match booking total' }
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { reference }, data: { status: 'paid' } }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'confirmed', paymentId: payment.id },
    }),
  ])

  return { ok: true, status: 'paid', bookingId: payment.bookingId, reference }
}

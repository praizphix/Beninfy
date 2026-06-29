import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

type RateLimitOptions = {
  scope: string
  identifier: string
  limit: number
  windowMs: number
}

export function requestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function checkRateLimit({ scope, identifier, limit, windowMs }: RateLimitOptions) {
  const now = new Date()
  const key = createHash('sha256').update(`${scope}:${identifier}`).digest('hex')
  const existing = await prisma.rateLimitBucket.findUnique({ where: { key } })

  if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    })
    return { allowed: true as const, remaining: Math.max(0, limit - 1), retryAfter: 0 }
  }

  if (existing.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now.getTime() - existing.windowStart.getTime())) / 1000))
    return { allowed: false as const, remaining: 0, retryAfter }
  }

  const updated = await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  })

  return { allowed: true as const, remaining: Math.max(0, limit - updated.count), retryAfter: 0 }
}

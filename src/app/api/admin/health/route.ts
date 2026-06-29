import { NextResponse } from 'next/server'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    const rateLimit = await checkRateLimit({
      scope: 'admin-health',
      identifier: requestIp(req),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    const signupCode = process.env.ADMIN_SIGNUP_CODE
    if (!signupCode) {
      return NextResponse.json({ ok: false, error: 'ADMIN_SIGNUP_CODE is missing' }, { status: 503 })
    }

    const body = (await req.json().catch(() => ({}))) as { code?: string }
    if (body.code !== signupCode) {
      return NextResponse.json({ ok: false, error: 'Invalid diagnostic code' }, { status: 403 })
    }

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json({ ok: false, error: 'DATABASE_URL is missing' }, { status: 503 })
    }
    if (databaseUrl.startsWith('"') || databaseUrl.endsWith('"') || databaseUrl.includes('[YOUR-PASSWORD]')) {
      return NextResponse.json({ ok: false, error: 'DATABASE_URL is not pasted correctly' }, { status: 503 })
    }

    const { prisma } = await import('@/lib/prisma')
    const [userCount, vehicleCount, tourCount] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.tour.count(),
    ])

    return NextResponse.json({
      ok: true,
      database: 'connected',
      counts: { users: userCount, vehicles: vehicleCount, tours: tourCount },
      adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
    })
  } catch (error) {
    console.error('Admin health check failed', error)
    return NextResponse.json({ ok: false, error: 'Health check failed' }, { status: 500 })
  }
}

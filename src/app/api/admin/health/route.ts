import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function describeError(error: unknown) {
  if (!(error instanceof Error)) return 'Unknown non-error exception'

  return `${error.name}: ${error.message
    .replace(/postgres(?:ql)?:\/\/[^\s'")]+/gi, 'postgresql://[redacted]')
    .replace(/password=[^&\s'")]+/gi, 'password=[redacted]')
    .slice(0, 220)}`
}

export async function POST(req: Request) {
  try {
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
    return NextResponse.json({ ok: false, error: describeError(error) }, { status: 500 })
  }
}

import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  phone: z.string().trim().min(4).max(30).optional(),
  code: z.string().trim().min(1),
})

function getDatabaseConfigError() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return 'DATABASE_URL is missing in deployment settings'
  if (databaseUrl !== databaseUrl.trim()) return 'DATABASE_URL has extra spaces in deployment settings'
  if (databaseUrl.startsWith('"') || databaseUrl.startsWith("'") || databaseUrl.endsWith('"') || databaseUrl.endsWith("'")) {
    return 'DATABASE_URL should be saved in Vercel without wrapping quotes'
  }
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    return 'DATABASE_URL must start with postgresql://'
  }
  if (databaseUrl.includes('[YOUR-PASSWORD]')) return 'DATABASE_URL still contains the password placeholder'
  return null
}

export async function POST(req: Request) {
  try {
    const signupCode = process.env.ADMIN_SIGNUP_CODE
    if (!signupCode) {
      return NextResponse.json({ error: 'Admin signup is not configured' }, { status: 503 })
    }

    const databaseConfigError = getDatabaseConfigError()
    if (databaseConfigError) {
      return NextResponse.json({ error: databaseConfigError }, { status: 503 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
    }

    const { name, password, phone, code } = parsed.data
    const email = parsed.data.email.toLowerCase()
    if (code !== signupCode) {
      return NextResponse.json({ error: 'Invalid admin signup code' }, { status: 403 })
    }

    const { prisma } = await import('@/lib/prisma')
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const superAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    const role = superAdminEmail && email.toLowerCase() === superAdminEmail ? 'super_admin' : 'admin'

    const user = await prisma.user.create({
      data: { name, email, hashedPassword, phone, role },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Admin signup failed', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: `Database error: ${error.code}` }, { status: 500 })
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: 'Database connection failed. Check DATABASE_URL in Vercel.' }, { status: 500 })
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: 'Database schema mismatch. Run Prisma migrations on the deployed database.' }, { status: 500 })
    }
    if (error instanceof Error && /connection string|database url|invalid url|postgres/i.test(error.message)) {
      return NextResponse.json({ error: 'Database connection string is invalid in deployment settings' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Server error. Check deployment logs.' }, { status: 500 })
  }
}

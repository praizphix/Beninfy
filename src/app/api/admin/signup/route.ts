import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  phone: z.string().trim().min(4).max(30).optional(),
  code: z.string().trim().min(1),
})

export async function POST(req: Request) {
  try {
    const signupCode = process.env.ADMIN_SIGNUP_CODE
    if (!signupCode) {
      return NextResponse.json({ error: 'Admin signup is not configured' }, { status: 503 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password, phone, code } = parsed.data
    if (code !== signupCode) {
      return NextResponse.json({ error: 'Invalid admin signup code' }, { status: 403 })
    }

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
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

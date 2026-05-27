import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth'

export type Role = 'user' | 'admin' | 'super_admin'

export function getRole(session: Session | null): Role | undefined {
  return (session?.user as { role?: Role } | undefined)?.role
}

export async function requireAdmin() {
  const session = (await auth()) as Session | null
  const role = getRole(session)
  if (!session?.user?.id || (role !== 'admin' && role !== 'super_admin')) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { ok: true as const, session, role: role as Role }
}

export async function requireSuperAdmin() {
  const session = (await auth()) as Session | null
  const role = getRole(session)
  if (!session?.user?.id || role !== 'super_admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Super admin required' }, { status: 403 }),
    }
  }
  return { ok: true as const, session, role: role as Role }
}

import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/roles'

export async function requireCustomer() {
  const session = (await auth()) as Session | null
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (isAdminRole(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Use the backoffice for admin accounts' }, { status: 403 }),
    }
  }

  return { ok: true as const, session }
}

import { NextResponse } from 'next/server'
import { getRoutePriceOverrides } from '@/lib/routePriceOverrides'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const routeId = searchParams.get('routeId') || undefined
  const overrides = await getRoutePriceOverrides(routeId)
  return NextResponse.json({ overrides })
}

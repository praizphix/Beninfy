import { NextResponse } from 'next/server'
import { getPublicTours } from '@/lib/tourCatalog'

export async function GET() {
  const tours = await getPublicTours()
  return NextResponse.json(
    { tours },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } }
  )
}

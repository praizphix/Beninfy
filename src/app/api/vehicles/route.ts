import { NextResponse } from 'next/server'
import { getPublicVehicles } from '@/lib/vehicleCatalog'

export async function GET() {
  const vehicles = await getPublicVehicles()
  return NextResponse.json(
    { vehicles },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } }
  )
}

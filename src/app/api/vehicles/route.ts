import { NextResponse } from 'next/server'
import { getPublicVehicles } from '@/lib/vehicleCatalog'

export async function GET() {
  const vehicles = await getPublicVehicles()
  return NextResponse.json({ vehicles })
}

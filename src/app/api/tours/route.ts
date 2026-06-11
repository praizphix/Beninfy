import { NextResponse } from 'next/server'
import { getPublicTours } from '@/lib/tourCatalog'

export async function GET() {
  const tours = await getPublicTours()
  return NextResponse.json({ tours })
}

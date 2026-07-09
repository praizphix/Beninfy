import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fleetVehicles = await prisma.fleetVehicle.findMany({
    where: { status: 'available' },
    orderBy: [{ vehicleId: 'asc' }, { label: 'asc' }],
    select: {
      id: true,
      vehicleId: true,
      label: true,
      color: true,
      currentCity: true,
      vehicle: {
        select: {
          id: true,
          name: true,
          image: true,
          capacity: true,
          luggageCapacity: true,
          description: true,
          features: true,
        },
      },
    },
  })

  return NextResponse.json(
    { fleetVehicles },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } }
  )
}

'use client'

import { useEffect, useState } from 'react'

export interface PublicFleetVehicle {
  id: string
  vehicleId: string
  label: string
  color: string | null
  currentCity: string | null
  vehicle?: {
    id: string
    name: string
    image: string | null
    capacity: number
    luggageCapacity: number
    description: string | null
    features: string[]
  }
}

export function useFleetVehicles() {
  const [fleetVehicles, setFleetVehicles] = useState<PublicFleetVehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/fleet-vehicles')
      .then((res) => (res.ok ? res.json() : { fleetVehicles: [] }))
      .then((data: { fleetVehicles?: PublicFleetVehicle[] }) => {
        if (!cancelled) setFleetVehicles(data.fleetVehicles ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { fleetVehicles, loading }
}

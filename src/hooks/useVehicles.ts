'use client'

import { useEffect, useState } from 'react'
import type { Vehicle } from '@/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/vehicles')
      .then((res) => (res.ok ? res.json() : { vehicles: [] }))
      .then((data: { vehicles?: Vehicle[] }) => {
        if (!cancelled) setVehicles(data.vehicles ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { vehicles, loading }
}

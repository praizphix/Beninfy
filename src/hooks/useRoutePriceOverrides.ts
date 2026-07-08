'use client'

import { useEffect, useState } from 'react'
import type { RoutePriceOverrides } from '@/data/pricing'

export function useRoutePriceOverrides(routeId?: string) {
  const [overrides, setOverrides] = useState<RoutePriceOverrides>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (routeId) params.set('routeId', routeId)

    setLoading(true)
    fetch(`/api/route-prices${params.size ? `?${params.toString()}` : ''}`)
      .then((res) => (res.ok ? res.json() : { overrides: {} }))
      .then((data: { overrides?: RoutePriceOverrides }) => {
        if (!cancelled) setOverrides(data.overrides ?? {})
      })
      .catch(() => {
        if (!cancelled) setOverrides({})
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [routeId])

  return { overrides, loading }
}

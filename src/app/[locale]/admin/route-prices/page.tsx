'use client'

import { useEffect, useState } from 'react'
import { CrudTable } from '@/components/admin/CrudTable'
import { routes as fallbackRoutes } from '@/data/routes'
import { vehicles as fallbackVehicles } from '@/data/vehicles'
import { formatNGN } from '@/lib/utils'
import { ROUTE_PRICE_SCOPE_OPTIONS, routePriceScopeLabel } from '@/lib/routePriceScopes'

interface RoutePrice {
  id: string
  routeId: string
  vehicleId: string
  pricingScope: string
  amountNGN: number
  notes: string | null
  route?: { id: string; from: string; to: string }
  [key: string]: unknown
}

interface RouteOption {
  id: string
  from: string
  to: string
}

interface VehicleOption {
  id: string
  name: string
}

const FALLBACK_ROUTE_OPTIONS = fallbackRoutes.map((route) => ({
  label: `${route.from} → ${route.to}`,
  value: route.id,
}))

const FALLBACK_VEHICLE_OPTIONS = fallbackVehicles.map((vehicle) => ({
  label: vehicle.name,
  value: vehicle.id,
}))

export default function AdminRoutePricesPage() {
  const [routeOptions, setRouteOptions] = useState<Array<{ label: string; value: string }>>(FALLBACK_ROUTE_OPTIONS)
  const [vehicleOptions, setVehicleOptions] = useState<Array<{ label: string; value: string }>>(FALLBACK_VEHICLE_OPTIONS)
  const vehicleLabel = (vehicleId: string) => vehicleOptions.find((option) => option.value === vehicleId)?.label ?? vehicleId

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch('/api/admin/routes').then((res) => (res.ok ? res.json() : { routes: [] })),
      fetch('/api/admin/vehicles').then((res) => (res.ok ? res.json() : { vehicles: [] })),
    ])
      .then(([routeData, vehicleData]: [{ routes?: RouteOption[] }, { vehicles?: VehicleOption[] }]) => {
        if (cancelled) return
        const routes = (routeData.routes ?? [])
          .filter((route) => route.id && route.from && route.to)
          .map((route) => ({ label: `${route.from} → ${route.to}`, value: route.id }))
        const vehicles = (vehicleData.vehicles ?? [])
          .filter((vehicle) => vehicle.id && vehicle.name)
          .map((vehicle) => ({ label: vehicle.name, value: vehicle.id }))

        if (routes.length > 0) setRouteOptions(routes)
        if (vehicles.length > 0) setVehicleOptions(vehicles)
      })
      .catch(() => {
        if (!cancelled) {
          setRouteOptions(FALLBACK_ROUTE_OPTIONS)
          setVehicleOptions(FALLBACK_VEHICLE_OPTIONS)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CrudTable<RoutePrice>
      title="Route prices"
      description="Manage one-way drop-off fares per route and booking category. These prices override the code fallback table."
      fetchUrl="/api/admin/route-prices"
      collectionKey="routePrices"
      itemKey="id"
      createUrl="/api/admin/route-prices"
      itemUrl={(id) => `/api/admin/route-prices/${id}`}
      columns={[
        { header: 'Route', render: (p) => p.route ? `${p.route.from} → ${p.route.to}` : p.routeId },
        { header: 'Category', render: (p) => vehicleLabel(p.vehicleId) },
        { header: 'Scope', render: (p) => routePriceScopeLabel(p.pricingScope) },
        { header: 'Drop-off fare', render: (p) => <span className="font-semibold text-gray-900">{formatNGN(p.amountNGN)}</span> },
        { header: 'Notes', render: (p) => p.notes ?? '—' },
      ]}
      fields={[
        {
          name: 'routeId',
          label: 'Route',
          type: 'select',
          required: true,
          options: routeOptions,
        },
        {
          name: 'vehicleId',
          label: 'Booking category / pricing bucket',
          type: 'select',
          required: true,
          options: vehicleOptions,
        },
        {
          name: 'pricingScope',
          label: 'Pricing scope',
          type: 'select',
          required: true,
          options: ROUTE_PRICE_SCOPE_OPTIONS,
        },
        { name: 'amountNGN', label: 'One-way drop-off fare (NGN)', type: 'number', required: true },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional internal note, e.g. agency rate or seasonal price' },
      ]}
    />
  )
}

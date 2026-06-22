import type { RouteId, VehicleId, PriceRange } from '@/types'

/**
 * Official Beninfy route pricing in Nigerian Naira (₦).
 * Saloon prices shown as ranges (min/max); all other vehicles are fixed.
 */
export const routePricing: Record<RouteId, Partial<Record<VehicleId, number | PriceRange>>> = {
  'lagos-cotonou': {
    saloon:  { min: 160_000, max: 170_000 },
    suv:     260_000,
    sienna:  250_000,
    prado:   260_000,
    sprinter: 700_000,
    hiace:   750_000,
    coastal: 900_000,
  },
  'lagos-ouidah': {
    saloon:  220_000,
    sienna:  300_000,
    suv:     300_000,
  },
  'cotonou-togo': {
    saloon:  { min: 150_000, max: 160_000 },
    suv:     250_000,
    sienna:  240_000,
    prado:   250_000,
    sprinter: 650_000,
    hiace:   700_000,
    coastal: 850_000,
  },
  'togo-ghana': {
    saloon:  { min: 160_000, max: 170_000 },
    suv:     260_000,
    sienna:  250_000,
    prado:   260_000,
    sprinter: 700_000,
    hiace:   750_000,
    coastal: 900_000,
  },
  'lagos-togo': {
    saloon:  { min: 320_000, max: 330_000 },
    suv:     520_000,
    sienna:  490_000,
    prado:   520_000,
    sprinter: 1_350_000,
    hiace:   1_450_000,
    coastal: 1_750_000,
  },
  'lagos-aneho': {
    saloon:  420_000,
    sienna:  400_000,
    suv:     400_000,
  },
  'lagos-kpalime': {
    saloon:  420_000,
    sienna:  400_000,
    suv:     400_000,
  },
  'lagos-ghana': {
    saloon:  { min: 470_000, max: 480_000 },
    suv:     770_000,
    sienna:  740_000,
    prado:   770_000,
    sprinter: 2_050_000,
    hiace:   2_200_000,
    coastal: 2_650_000,
  },
}

/** Daily tour-use rate per vehicle (₦/day) */
export const tourDailyRates: Partial<Record<VehicleId, number>> = {
  saloon:  105_000,
  suv:     160_000,
  sienna:  150_000,
  prado:   160_000,
  sprinter: 310_000,
  hiace:   210_000,
  coastal: 260_000,
}

/** 1.5-day all-inclusive transport + tour packages (₦) */
export const packageRates: Partial<Record<VehicleId, number>> = {
  saloon:  500_000,
  suv:     800_000,
  sienna:  800_000,
  prado:   1_100_000,
  sprinter: 1_600_000,
  hiace:   1_500_000,
  coastal: 2_000_000,
}

/** Returns the price for a given route + vehicle combination */
export function getRoutePrice(routeId: RouteId, vehicleId: VehicleId): number | PriceRange | null {
  return routePricing[routeId]?.[vehicleId] ?? null
}

/**
 * Returns the starting (minimum) price for a route.
 * Defaults to saloon car base price.
 */
export function getRouteBasePrice(routeId: RouteId): number {
  const price = routePricing[routeId]?.saloon
  if (!price) return 0
  if (typeof price === 'object') return price.min
  return price
}

/** Formats a price or range as a display string, e.g. "₦160,000" or "₦160,000–₦170,000" */
export function formatPriceRange(price: number | PriceRange): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)
  if (typeof price === 'number') return fmt(price)
  return `${fmt(price.min)}\u2013${fmt(price.max)}`
}

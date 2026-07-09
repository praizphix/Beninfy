import type { RoutePriceScope } from '@/data/pricing'

export const ROUTE_PRICE_SCOPE_OPTIONS: Array<{ value: RoutePriceScope; label: string }> = [
  { value: 'default', label: 'Standard route fare' },
  { value: 'mainland', label: 'Mainland pickup' },
  { value: 'island', label: 'Island pickup' },
]

export function routePriceScopeLabel(scope: string | null | undefined) {
  return ROUTE_PRICE_SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? 'Standard route fare'
}

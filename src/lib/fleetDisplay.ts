const INVENTORY_SUFFIX_PATTERN = /\s+(?:0?\d{1,2})$/

export function getFleetVehicleDisplayLabel(label: string | null | undefined) {
  const trimmed = (label ?? '').trim()
  if (!trimmed) return 'Vehicle'
  return trimmed.replace(INVENTORY_SUFFIX_PATTERN, '').trim() || trimmed
}
